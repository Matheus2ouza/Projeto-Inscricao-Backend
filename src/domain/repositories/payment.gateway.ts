import { PaymentMethod, StatusPayment } from 'generated/prisma';
import { PaymentsSummary } from 'src/usecases/web/payments/list-all-payments/list-all-payments.usecase';
import { Payment } from '../entities/payment.entity';

export abstract class PaymentGateway {
  // CRUD básico
  abstract create(payment: Payment): Promise<Payment>;

  // Buscas e listagens
  abstract findById(id: string): Promise<Payment | null>;
  abstract findByAsaasCheckout(
    asaasCheckoutId: string,
  ): Promise<Payment | null>;
  abstract findByPaymentLink(paymentLinkId: string): Promise<Payment | null>;
  abstract findByExternalReference(
    externalReference: string,
  ): Promise<Payment | null>;
  abstract findAllPaginated(
    eventId: string,
    page: number,
    pageSize: number,
    filter?: {
      accountId?: string;
      status?: StatusPayment[];
      methodPayment?: PaymentMethod[];
    },
  ): Promise<Payment[]>;
  abstract findAllByInscriptionIdPaginated(
    inscriptionId: string,
    page: number,
    pageSize: number,
  ): Promise<Payment[]>;
  abstract findAllByInscriptionId(inscriptionId: string): Promise<Payment[]>;
  abstract findByInscriptionId(inscriptionId: string): Promise<Payment | null>;
  abstract findResponsible(id: string): Promise<string | undefined>;

  // Agregações e contagens
  abstract countAllFiltered(
    eventId: string,
    filters?: {
      accountId?: string;
      status?: StatusPayment[];
      paymentMethod?: PaymentMethod[];
    },
  ): Promise<number>;
  abstract countParticipantByInscriptionId(
    inscriptionId: string,
  ): Promise<number>;
  abstract countAllOrdered(
    eventId: string,
    accountId?: string,
  ): Promise<PaymentsSummary>;
  abstract countTotalPaid(
    eventId: string,
    filter: {
      limitTime?: string;
    },
    accountId?: string,
  ): Promise<number>;
  abstract countTotalDue(
    eventId: string,
    filter: {
      limitTime?: string;
    },
    accountId?: string,
  ): Promise<number>;
  // Conta quantos pagamentos foram feitos para o evento, independentemente do status
  abstract countAllByEventId(eventId: string): Promise<number>;
  // Conta quantos pagamentos foram feitos para o evento, apenas os que estão em análise
  abstract countAllInAnalysis(eventId: string): Promise<number>;
  // Soma o valor total de todos os pagamentos em análise para o evento
  abstract countTotalAmountInAnalysis(eventId: string): Promise<number>;

  // Atualizações
  abstract update(payment: Payment): Promise<Payment>;

  //Deletes
  abstract delete(id: string): Promise<void>;
}
