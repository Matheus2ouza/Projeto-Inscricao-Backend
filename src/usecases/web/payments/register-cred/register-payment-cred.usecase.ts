import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import { Event } from 'src/domain/entities/event.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Utils } from 'src/shared/utils/utils';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InscriptionNotReleasedForPaymentUsecaseException } from '../../exceptions/paymentInscription/inscription-not-released-for-payment.usecase.exception';
import { InvalidInscriptionIdUsecaseException } from '../../exceptions/paymentInscription/invalid-inscription-id.usecase.exception ';
import { OverpaymentNotAllowedUsecaseException } from '../../exceptions/paymentInscription/overpayment-not-allowed.usecase.exception';

export type RegisterPaymentCredInput = {
  eventId: string;
  accountId?: string;
  guestEmail?: string;
  isGuest?: boolean;
  totalValue: number;
  client: Client;
  inscriptions: Inscription[];
  passCustomerToAsaas?: boolean;
};

type Client = {
  name: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  address: string;
  addressNumber: string;
  complement: string;
  postalCode: string;
  province: string;
  city: number;
};

type Inscription = {
  id: string;
};

export type RegisterPaymentCredOutput = {
  id: string;
  link: string;
  status: string;
};

type AsaasCheckoutResponse = {
  id: string;
  link: string;
  externalReference: string;
  status: string;
};

@Injectable()
export class RegisterPaymentCredUsecase
  implements Usecase<RegisterPaymentCredInput, RegisterPaymentCredOutput>
{
  private readonly logger = new Logger(RegisterPaymentCredUsecase.name);

  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: RegisterPaymentCredInput,
  ): Promise<RegisterPaymentCredOutput> {
    // preset das taxas do ASAAS
    const percentFee = 0.0399; // 3,99%
    const fixedFee = 0.49; // taxa fixa: R$ 0.49

    //Valida se o Evento existe
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found.`,
        `Evento não encontrado.`,
        RegisterPaymentCredUsecase.name,
      );
    }

    const inscriptionIds = input.inscriptions.map((i) => i.id);
    const inscriptionsEntities =
      await this.inscriptionGateway.findManyByIds(inscriptionIds);

    if (inscriptionsEntities.length !== inscriptionIds.length) {
      throw new InvalidInscriptionIdUsecaseException(
        'One or more inscription IDs are invalid',
        'Um ou mais IDs de inscrição são inválidos',
        RegisterPaymentCredUsecase.name,
      );
    }

    let totalDue = 0;

    for (const inscription of inscriptionsEntities) {
      // Validação
      if (inscription.getStatus() === InscriptionStatus.UNDER_REVIEW) {
        throw new InscriptionNotReleasedForPaymentUsecaseException(
          `Attempted payment before inscription release id: ${inscription.getId()}`,
          'O pagamento ainda não está liberado para esta inscrição.',
          RegisterPaymentCredUsecase.name,
        );
      }

      const remainingDebt = Math.max(
        0,
        inscription.getTotalValue() - inscription.getTotalPaid(),
      );
      totalDue += remainingDebt;
    }

    if (input.totalValue > totalDue) {
      throw new OverpaymentNotAllowedUsecaseException(
        `attempted payment but the amount passed (${input.totalValue}) exceeds the debt amount (${totalDue})`,
        `O valor passado é maior que a dívida`,
        RegisterPaymentCredUsecase.name,
      );
    }

    const finalValue = Number(
      (input.totalValue * (1 + percentFee) + fixedFee).toFixed(2),
    );

    //Cria as url's para o callback do ASAAS
    const successUrl = input.isGuest
      ? `${process.env.URL_CALLBACK}/guest/${event.getId()}/payment/success?eventId=${event.getId()}&clientName=${encodeURIComponent(input.client.name)}&confirmationCode=${encodeURIComponent(inscriptionsEntities[0].getConfirmationCode()!)}`
      : `${process.env.URL_CALLBACK}/user/payment-success`;

    const cancelUrl = input.isGuest
      ? `${process.env.URL_CALLBACK}/guest/${event.getId()}/inscription?confirmationCode=${encodeURIComponent(inscriptionsEntities[0].getConfirmationCode()!)}`
      : `${process.env.URL_CALLBACK}/user/payment/canceled`;

    const expiredUrl = input.isGuest
      ? `${process.env.URL_CALLBACK}/guest/${event.getId()}/inscription?confirmationCode=${encodeURIComponent(inscriptionsEntities[0].getConfirmationCode()!)}`
      : `${process.env.URL_CALLBACK}/user/payment/expired`;

    const imagePath = await this.loadEventImage(event.getImageUrl());

    // Cria o checkout no ASAAS
    this.logger.log(
      `passCustomerToAsaas: ${input.passCustomerToAsaas === true ? 'true' : 'false'}`,
    );
    const checkout = await this.createCheckout(
      event,
      finalValue,
      input.client,
      successUrl,
      cancelUrl,
      expiredUrl,
      input.passCustomerToAsaas,
      imagePath,
    );

    // Cria o pagamento no com os dados para confirmação posteriomente do webhook
    // O installmente é setado como 1 mas ao confirmar o pagamento, o ASAAS retornará o número de parcelas
    // Se for um convidado, o pagamento é registrado com o email do convidado
    // E o accountId é setado como null
    // Se for um usuário, o pagamento é registrado com o accountId
    // E o guestEmail é setado como null
    const payment = Payment.create({
      eventId: event.getId(),
      status: StatusPayment.UNDER_REVIEW,
      totalValue: input.totalValue,
      totalPaid: 0,
      installment: 1,
      methodPayment: PaymentMethod.CARTAO,
      asaasCheckoutId: checkout.id,
      externalReference: checkout.externalReference,
      isGuest: input.isGuest,
      ...(input.isGuest
        ? { guestEmail: input.guestEmail, guestName: input.client.name }
        : { accountId: input.accountId }),
    });

    await this.paymentGateway.create(payment);

    let remainingValue = input.totalValue;
    const allocations: PaymentAllocation[] = [];
    const increments: { inscriptionId: string; value: number }[] = [];

    for (const inscription of inscriptionsEntities) {
      const remainingInscriptionDebt = Math.max(
        0,
        inscription.getTotalValue() - inscription.getTotalPaid(),
      );
      const allocationValue = Math.min(
        remainingInscriptionDebt,
        remainingValue,
      );

      if (allocationValue > 0) {
        allocations.push(
          PaymentAllocation.create({
            paymentId: payment.getId(),
            inscriptionId: inscription.getId(),
            value: allocationValue,
          }),
        );

        increments.push({
          inscriptionId: inscription.getId(),
          value: allocationValue,
        });

        remainingValue -= allocationValue;
        if (remainingValue <= 0) break;
      }
    }

    await this.paymentAllocationGateway.createMany(allocations);
    await this.inscriptionGateway.incrementTotalPaidMany(increments);

    const output: RegisterPaymentCredOutput = {
      id: checkout.id,
      link: checkout.link,
      status: checkout.status,
    };
    return output;
  }

  private async createCheckout(
    event: Event,
    totalValue: number,
    client: Client,
    successUrl: string,
    cancelUrl: string,
    expiredUrl: string,
    passCustomerToAsaas?: boolean,
    imagePath?: string,
  ): Promise<AsaasCheckoutResponse> {
    const paymentReferenceId = Utils.generateUUID();
    const customerData =
      passCustomerToAsaas === true
        ? {
            name: client.name,
            email: client.email,
            cpfCnpj: client.cpfCnpj,
            phone: client.phone,
            address: client.address,
            addressNumber: client.addressNumber,
            complement: client.complement,
            postalCode: client.postalCode,
            province: client.province,
            city: client.city,
          }
        : undefined;
    this.logger.log(
      `customerData enviado ao ASAAS: ${customerData ? 'true' : 'false'}`,
    );

    const checkout = await axios.post<AsaasCheckoutResponse>(
      process.env.ASAAS_API_URL!,
      {
        billingTypes: ['CREDIT_CARD'],
        chargeTypes: ['DETACHED', 'INSTALLMENT'],
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
        installment: {
          maxInstallmentCount: 3,
        },
        customerData,
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
