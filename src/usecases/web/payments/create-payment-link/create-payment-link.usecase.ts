import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
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
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Utils } from 'src/shared/utils/utils';
import { Usecase } from 'src/usecases/usecase';
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

    if (inscription.getStatus() === InscriptionStatus.UNDER_REVIEW) {
      throw new InscriptionNotReleasedForPaymentUsecaseException(
        `Attempted payment before inscription release id: ${inscription.getId()}`,
        'O pagamento ainda não está liberado para esta inscrição.',
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
    const successUrl = inscription.getIsGuest()
      ? `${process.env.URL_CALLBACK_PAYMENT_LINK}/guest/${event.getId()}/payment/success?eventId=${event.getId()}&clientName=${encodeURIComponent(inscription.getGuestName()!)}&confirmationCode=${encodeURIComponent(inscription.getConfirmationCode()!)}`
      : `${process.env.URL_CALLBACK_PAYMENT_LINK}/user/payment-success`;

    const cancelUrl = inscription.getIsGuest()
      ? `${process.env.URL_CALLBACK_PAYMENT_LINK}/guest/${event.getId()}/inscription?confirmationCode=${encodeURIComponent(encodeURIComponent(inscription.getConfirmationCode()!))}`
      : `${process.env.URL_CALLBACK_PAYMENT_LINK}/user/payment/canceled`;

    const expiredUrl = inscription.getIsGuest()
      ? `${process.env.URL_CALLBACK_PAYMENT_LINK}/guest/${event.getId()}/inscription?confirmationCode=${encodeURIComponent(encodeURIComponent(inscription.getConfirmationCode()!))}`
      : `${process.env.URL_CALLBACK_PAYMENT_LINK}/user/payment/expired`;

    const now = new Date();
    now.setHours(now.getHours() + 24);
    const endDate: string = now.toISOString().split('T')[0];

    const externalReference = Utils.generateUUID();

    this.logger.log(
      `Criando link de pagamento | inscrição: ${inscription.getId()} | evento: ${event.getId()} | dívida: ${totalDue.toFixed(2)} | cobrado: ${finalValue.toFixed(2)}`,
    );

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

    const paymenLink = PaymentLink.create({
      name: asaasPaymentLink.name,
      description: asaasPaymentLink.description,
      value: asaasPaymentLink.value,
      asaasPaymentLinkId: asaasPaymentLink.id,
      url: asaasPaymentLink.url,
      active: asaasPaymentLink.active,
      endDateAt: new Date(asaasPaymentLink.endDate),
    });

    await this.paymentLinkGateway.create(paymenLink);

    const payment = Payment.create({
      eventId: event.getId(),
      status: StatusPayment.UNDER_REVIEW,
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

    await this.paymentGateway.create(payment);

    const allocation = PaymentAllocation.create({
      paymentId: payment.getId(),
      inscriptionId: inscription.getId(),
      value: payment.getTotalValue(),
    });

    await this.paymentAllocationGateway.create(allocation);
    inscription.incrementeTotalPaid(allocation.getValue());
    await this.inscriptionGateway.update(inscription);

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
      maxInstallmentCount: 3,
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

    const { data } = await axios.post<asaasPaymentLinkResponse>(
      process.env.ASAAS_PAYMENT_LINK_URL!,
      customerData,
      {
        headers: {
          accept: 'application/json',
          access_token: process.env.ASAAS_API_TOKEN!,
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      value: data.value,
      url: data.url,
      externalReference: data.externalReference,
      active: data.active,
      endDate: data.endDate,
    };
  }

  private async loadEventImage(
    imagePath?: string | null,
  ): Promise<string | undefined> {
    if (!imagePath) return undefined;

    try {
      const signedUrl =
        await this.supabaseStorageService.getPublicUrl(imagePath);
      const response = await fetch(signedUrl);

      if (!response.ok) {
        console.warn(
          `Failed to load event image: ${response.status} ${response.statusText}`,
        );
        return undefined;
      }

      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      // Retorna apenas o base64, sem o prefixo "data:image/jpeg;base64,"
      return base64;
    } catch (error) {
      console.warn('Error while loading event image:', error);
      return undefined;
    }
  }
}
