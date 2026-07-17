import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import { Event } from 'src/domain/entities/event/event.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Utils } from 'src/shared/utils/utils';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InscriptionNotReleasedForPaymentUsecaseException } from '../../exceptions/payment-Inscription/inscription-not-released-for-payment.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from '../../exceptions/payment-Inscription/invalid-inscription-id.usecase.exception ';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/payment-Inscription/overpayment-not-allowed.usecase.exception';

export type RegisterPaymentPixAssasInput = {
  inscriptionId: string;
};

type AsaasCheckoutResponse = {
  id: string;
  link: string;
  externalReference: string;
  status: string;
};

export type RegisterPaymentPixAssasOutput = {
  id: string;
  link: string;
  status: string;
};

@Injectable()
export class RegisterPaymentPixAssasUsescase
  implements
    Usecase<RegisterPaymentPixAssasInput, RegisterPaymentPixAssasOutput>
{
  private readonly logger = new Logger(RegisterPaymentPixAssasUsescase.name);
  public constructor(
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: RegisterPaymentPixAssasInput,
  ): Promise<RegisterPaymentPixAssasOutput> {
    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InvalidInscriptionIdUsecaseException(
        `Attempt to pay for registration, but the ID provided is invalid. inscriptionId: ${input.inscriptionId}`,
        'Inscrição não encontrada',
        RegisterPaymentPixAssasUsescase.name,
      );
    }

    if (inscription.getStatus() === InscriptionStatus.UNDER_REVIEW) {
      throw new InscriptionNotReleasedForPaymentUsecaseException(
        `Attempted payment before inscription release id: ${inscription.getId()}`,
        'O pagamento ainda não está liberado para esta inscrição.',
        RegisterPaymentPixAssasUsescase.name,
      );
    }

    const event = await this.eventGateway.findById(inscription.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempted payment for registration: ${inscription.getId()}, but required data was not found.`,
        `Não foi possível prosseguir com o pagamento pois alguns dados não foram encontrados.`,
        RegisterPaymentPixAssasUsescase.name,
      );
    }

    //Cria as url's para o callback do ASAAS
    const successUrl = inscription.getIsGuest()
      ? `${process.env.URL_CALLBACK}/guest/${event.getId()}/payment/success?eventId=${event.getId()}&clientName=${encodeURIComponent(inscription.getResponsible())}&confirmationCode=${encodeURIComponent(inscription.getConfirmationCode()!)}`
      : `${process.env.URL_CALLBACK}/user/payment-success`;

    const cancelUrl = inscription.getIsGuest()
      ? `${process.env.URL_CALLBACK}/guest/${event.getId()}/inscription?confirmationCode=${encodeURIComponent(inscription.getConfirmationCode()!)}`
      : `${process.env.URL_CALLBACK}/user/payment/canceled`;

    const expiredUrl = inscription.getIsGuest()
      ? `${process.env.URL_CALLBACK}/guest/${event.getId()}/inscription?confirmationCode=${encodeURIComponent(inscription.getConfirmationCode()!)}`
      : `${process.env.URL_CALLBACK}/user/payment/expired`;

    const imagePath = await this.loadEventImage(event.getImageUrl());

    const remainingDebt = Math.max(
      0,
      inscription.getTotalValue() - inscription.getTotalPaid(),
    );

    if (remainingDebt <= 0) {
      throw new OverpaymentNotAllowedUsecaseException(
        `attempted payment but inscription ${inscription.getId()} has no remaining debt`,
        `Não há valor pendente para esta inscrição`,
        RegisterPaymentPixAssasUsescase.name,
      );
    }

    const checkout = await this.createCheckout(
      event,
      remainingDebt,
      successUrl,
      cancelUrl,
      expiredUrl,
      imagePath,
    );

    // Cria o pagamento em memoria com os dados para confirmação posteriomente do webhook
    // O installmente é setado como 1 mas ao confirmar o pagamento, o ASAAS retornará o número de parcelas
    const payment = Payment.create({
      eventId: event.getId(),
      status: StatusPayment.UNDER_REVIEW,
      totalValue: remainingDebt,
      totalPaid: 0,
      totalReceived: 0,
      installment: 1,
      methodPayment: PaymentMethod.PIX,
      asaasCheckoutId: checkout.id,
      externalReference: checkout.externalReference,
      isGuest: inscription.getIsGuest(),
      ...(inscription.getIsGuest()
        ? {
            guestEmail: inscription.getGuestEmail(),
            guestName: inscription.getGuestName(),
          }
        : { accountId: inscription.getAccountId() }),
    });

    // Cria a alocação do pagamento para a inscrição
    const allocation = PaymentAllocation.create({
      paymentId: payment.getId(),
      inscriptionId: inscription.getId(),
      value: remainingDebt,
    });

    await this.prisma.runInTransaction(async (tx) => {
      await this.paymentGateway.createTx(payment, tx);
      await this.paymentAllocationGateway.createTx(allocation, tx);
    });

    // Incrementa o total pago da inscrição
    await this.inscriptionGateway.incrementTotalPaid(
      inscription.getId(),
      remainingDebt,
    );

    const output: RegisterPaymentPixAssasOutput = {
      id: checkout.id,
      link: checkout.link,
      status: checkout.status,
    };
    return output;
  }

  private async createCheckout(
    event: Event,
    totalValue: number,
    successUrl: string,
    cancelUrl: string,
    expiredUrl: string,
    imagePath?: string,
  ): Promise<AsaasCheckoutResponse> {
    const paymentReferenceId = Utils.generateUUID();

    const checkout = await axios.post<AsaasCheckoutResponse>(
      process.env.ASAAS_API_URL!,
      {
        billingTypes: ['PIX'],
        chargeTypes: ['DETACHED'],
        minutesToExpire: 10,
        externalReference: paymentReferenceId,
        callback: {
          cancelUrl,
          expiredUrl,
          successUrl,
        },
        items: [
          {
            name: event.getName(),
            imageBase64: imagePath,
            quantity: 1,
            value: totalValue,
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          access_token: process.env.ASAAS_API_TOKEN!,
        },
      },
    );

    return {
      id: checkout.data.id,
      link: checkout.data.link,
      externalReference: paymentReferenceId,
      status: checkout.data.status,
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
