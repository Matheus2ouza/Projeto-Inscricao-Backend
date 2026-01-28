import { StatusPayment } from 'generated/prisma';
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
  abstract findAllPaginated(
    eventId: string,
    page: number,
    pageSize: number,
    filter?: {
      accountId?: string;
      status?: StatusPayment[];
    },
  ): Promise<Payment[]>;
  abstract findAllByInscriptionIdPaginated(
    inscriptionId: string,
    page: number,
    pageSize: number,
  ): Promise<Payment[]>;

  // Agregações e contagens
  abstract countAllFiltered(
    eventId: string,
    filters?: {
      accountId?: string;
      status?: StatusPayment[];
    },
  ): Promise<number>;
  abstract countParticipantByInscriptionId(
    inscriptionId: string,
  ): Promise<number>;
  abstract countAllOrdered(
    accountId: string,
    eventId: string,
  ): Promise<PaymentsSummary>;
  abstract countTotalPaid(
    accountId: string,
    eventId: string,
    filter: {
      limitTime?: string;
    },
  ): Promise<number>;
  abstract countTotalDue(
    accountId: string,
    eventId: string,
    filter: {
      limitTime?: string;
    },
  ): Promise<number>;
  abstract countAllByEventId(eventId: string): Promise<number>;
  abstract countAllInAnalysis(eventId: string): Promise<number>;
  abstract countTotalAmountInAnalysis(eventId: string): Promise<number>;

  // Atualizações
  abstract update(payment: Payment): Promise<Payment>;

  //Deletes
  abstract delete(id: string): Promise<void>;
}
