import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import { Event } from 'src/domain/entities/event.entity';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { PaymentLink } from 'src/domain/entities/payment-link.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentLinkGateway } from 'src/domain/repositories/payment-link.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Utils } from 'src/shared/utils/utils';
import { Usecase } from 'src/usecases/usecase';
import { EnvironmentVariableNotFoundException } from '../../exceptions/environment-variable-not-found.usecase.exception';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InscriptionNotFoundUsecaseException } from '../../exceptions/inscription/find/inscription-not-found.usecase.exception';
import { InscriptionNotReleasedForPaymentUsecaseException } from '../../exceptions/payment-Inscription/inscription-not-released-for-payment.usecase.exception';

export type CreatePaymentLinkInput = {
  inscriptionId: string;
};

type asaasPaymentLinkResponse = {
  id: string;
  name: string;
  description: string;
  value: number;
  url: string;
  externalReference: string;
  active: boolean;
  endDate: string;
};

export type CreatePaymentLinkOutput = {
  url: string;
  active: boolean;
};

@Injectable()
export class CreatePaymentLinkUsecase
  implements Usecase<CreatePaymentLinkInput, CreatePaymentLinkOutput>
{
  private readonly logger = new Logger(CreatePaymentLinkUsecase.name);

  constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly eventGateway: EventGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentLinkGateway: PaymentLinkGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly prisma: PrismaService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: CreatePaymentLinkInput,
  ): Promise<CreatePaymentLinkOutput> {
    // preset das taxas do ASAAS
    const percentFee = 0.0399; // 3,99%
    const fixedFee = 0.49; // taxa fixa: R$ 0.49

    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `Attempt to create a payment link but registration was not found: ${input.inscriptionId}`,
        `Inscrição não encontrada`,
        CreatePaymentLinkUsecase.name,
      );
    }

    if (inscription.getStatus() !== InscriptionStatus.PENDING) {
      throw new InscriptionNotReleasedForPaymentUsecaseException(
        `Attempted payment link, but registration status is invalid. STATUS: ${inscription.getStatus()}, ID: ${inscription.getId()}.`,
        'O link de pagamento está indisponivel para esta inscrição.',
        CreatePaymentLinkUsecase.name,
      );
    }

    const totalDue = Math.max(
      0,
      inscription.getTotalValue() - inscription.getTotalPaid(),
    );

    const finalValue = Number(
      (totalDue * (1 + percentFee) + fixedFee).toFixed(2),
    );

    const event = await this.eventGateway.findById(inscription.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempt to create a payment link, but the relevant event was not found: ${inscription.getEventId()}`,
        `Não foi encontrado nenhum evento pare referenciar o pagamento`,
        CreatePaymentLinkUsecase.name,
      );
    }

    //Cria as url's para o callback do ASAAS
    const { successUrl, cancelUrl, expiredUrl } = this.buildCallbackUrls(
      event,
      inscription,
    );

    const now = new Date();
    now.setHours(now.getHours() + 24);

    // presets para o link de pagamento
    const endDate: string = now.toISOString().split('T')[0];
    const externalReference = Utils.generateUUID();

    // cria o link de pagamento no asaas
    const asaasPaymentLink = await this.createPaymentLink(
      event,
      inscription,
      finalValue,
      successUrl,
      cancelUrl,
      expiredUrl,
      endDate,
      externalReference,
    );

    // cria o paymentLink em memoria, ainda não salvo no banco
    const paymenLink = PaymentLink.create({
      name: asaasPaymentLink.name,
      description: asaasPaymentLink.description,
      value: asaasPaymentLink.value,
      asaasPaymentLinkId: asaasPaymentLink.id,
      url: asaasPaymentLink.url,
      active: asaasPaymentLink.active,
      endDateAt: new Date(asaasPaymentLink.endDate),
    });

    // cria o pagamento em memoria, ainda não salvo no banco
    const payment = Payment.create({
      eventId: event.getId(),
      status: StatusPayment.PENDING, // Fica como pendente, será aprovada ao asaas confirmar o pagamento
      totalValue: totalDue,
      totalPaid: 0,
      totalReceived: 0,
      installment: 1,
      methodPayment: PaymentMethod.CARTAO,
      paymentLinkId: paymenLink.getId(),
      externalReference: asaasPaymentLink.externalReference,
      isGuest: inscription.getIsGuest(),
      ...(inscription.getIsGuest()
        ? {
            guestEmail: inscription.getGuestEmail(),
            guestName: inscription.getGuestName(),
          }
        : { accountId: inscription.getAccountId() }),
    });

    const allocation = PaymentAllocation.create({
      paymentId: payment.getId(),
      inscriptionId: inscription.getId(),
      value: payment.getTotalValue(),
    });

    await this.prisma.runInTransaction(async (tx) => {
      await this.paymentLinkGateway.createTx(paymenLink, tx);
      await this.paymentGateway.createTx(payment, tx);
      await this.paymentAllocationGateway.createTx(allocation, tx);

      inscription.incrementeValuePaid(allocation.getValue());
      await this.inscriptionGateway.updateTx(inscription, tx);
    });

    void this.sendImageInPaymentLink(paymenLink, event);

    const output: CreatePaymentLinkOutput = {
      url: paymenLink.getUrl(),
      active: paymenLink.getActive(),
    };

    return output;
  }

  private async createPaymentLink(
    event: Event,
    inscription: Inscription,
    totalValue: number,
    successUrl: string,
    cancelUrl: string,
    expiredUrl: string,
    endDate: string,
    externalReference: string,
  ): Promise<asaasPaymentLinkResponse> {
    const customerData = {
      name: event.getName(),
      description: `Pagamento referente a inscrição de ${inscription.getResponsible()} ao evento: ${event.getName()}`,
      endDate,
      value: totalValue,
      billingType: 'CREDIT_CARD',
      chargeType: 'INSTALLMENT',
      maxInstallmentCount: 2,
      externalReference,
      notificationEnabled: false,
      callback: {
        cancelUrl,
        expiredUrl,
        successUrl,
        autoRedirect: false,
      },
      isAddressRequired: true,
    };

    if (!process.env.ASAAS_API_TOKEN) {
      throw new EnvironmentVariableNotFoundException(
        'attempted to create a payment link, but the ASAAS_API_TOKEN environment variable was not found',
        'Impossivel criar link de pagamento',
        CreatePaymentLinkUsecase.name,
      );
    }
    if (!process.env.ASAAS_PAYMENT_LINK_URL) {
      throw new EnvironmentVariableNotFoundException(
        'attempted to create a payment link, but the ASAAS_PAYMENT_LINK_URL environment variable was not found',
        'Impossivel criar link de pagamento',
        CreatePaymentLinkUsecase.name,
      );
    }

    try {
      const { data } = await axios.post<asaasPaymentLinkResponse>(
        process.env.ASAAS_PAYMENT_LINK_URL,
        customerData,
        {
          headers: {
            accept: 'application/json',
            access_token: process.env.ASAAS_API_TOKEN,
            'content-type': 'application/json',
          },
        },
      );

      return data;
    } catch (error: any) {
      this.logger.error('Erro ao criar link no Asaas', {
        status: error?.response?.status,
        data: error?.response?.data,
      });

      throw new Error(
        error?.response?.data?.errors?.[0]?.description ||
          'Erro ao criar link no Asaas',
      );
    }
  }

  private buildCallbackUrls(event: Event, inscription: Inscription) {
    const baseUrl = process.env.URL_CALLBACK_PAYMENT_LINK;
    const isGuest = inscription.getIsGuest();

    return {
      successUrl: isGuest
        ? `${baseUrl}/guest/${event.getId()}/payment/success?eventId=${event.getId()}&clientName=${encodeURIComponent(inscription.getResponsible())}&confirmationCode=${encodeURIComponent(inscription.getConfirmationCode()!)}`
        : `${baseUrl}/user/payment-success`,

      cancelUrl: isGuest
        ? `${baseUrl}/guest/${event.getId()}/inscription?confirmationCode=${encodeURIComponent(encodeURIComponent(inscription.getConfirmationCode()!))}`
        : `${baseUrl}/user/payment/canceled`,

      expiredUrl: isGuest
        ? `${baseUrl}/guest/${event.getId()}/inscription?confirmationCode=${encodeURIComponent(encodeURIComponent(inscription.getConfirmationCode()!))}`
        : `${baseUrl}/user/payment/expired`,
    };
  }

  private async sendImageInPaymentLink(
    paymentLink: PaymentLink,
    event: Event,
  ): Promise<void> {
    const imageUrl = event.getImageUrl();
    if (!imageUrl) {
      this.logger.warn('No event image to send to Asaas');
      return;
    }

    if (!process.env.ASAAS_API_TOKEN) {
      this.logger.warn('ASAAS_API_TOKEN not found');
      return;
    }

    if (!process.env.ASAAS_PAYMENT_LINK_URL) {
      this.logger.warn('ASAAS_PAYMENT_LINK_URL not found');
      return;
    }

    try {
      const imagePublicUrl =
        await this.supabaseStorageService.getPublicUrl(imageUrl);

      const { data } = await axios.get<ArrayBuffer>(imagePublicUrl, {
        responseType: 'arraybuffer',
      });

      const formData = new FormData();
      formData.append('main', 'true');
      formData.append('image', Buffer.from(data), {
        filename: `${event.getName()}.png`,
        contentType: 'image/png',
      });

      await axios.post(
        `${process.env.ASAAS_PAYMENT_LINK_URL}/${paymentLink.getAsaasPaymentLinkId()}/images`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            accept: 'application/json',
            access_token: process.env.ASAAS_API_TOKEN,
          },
        },
      );
    } catch (error: any) {
      this.logger.warn('Failed to send image to Asaas payment link', {
        paymentLinkId: paymentLink.getId(),
        asaasId: paymentLink.getAsaasPaymentLinkId(),
        status: error?.response?.status,
        data: error?.response?.data,
      });
    }
  }
}
