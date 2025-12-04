import { Prisma, StatusPayment } from 'generated/prisma';
import { PaymentInscription } from '../entities/payment-inscription';

export abstract class PaymentInscriptionGateway {
  // CRUD básico
  abstract create(
    paymentInscription: PaymentInscription,
  ): Promise<PaymentInscription>;
  abstract deletePayment(paymentId: string): Promise<void>;

  // Buscas por identificador único
  abstract findById(id: string): Promise<PaymentInscription | null>;

  // Buscas por relacionamento
  abstract findbyInscriptionId(id: string): Promise<PaymentInscription[]>;
  abstract findManyByInscriptionIds(
    inscriptionIds: string[],
  ): Promise<PaymentInscription[]>;
  abstract findToAnalysis(
    id: string,
    page: number,
    pageSize: number,
    filters?: {
      status?: StatusPayment[];
    },
  ): Promise<PaymentInscription[]>;

  abstract findByEventIdWithPagination(
    page: number,
    pageSize: number,
    orderBy?: {
      field: Prisma.PaymentInscriptionScalarFieldEnum;
      direction: 'asc' | 'desc';
    },
    filter?: {
      eventId?: string;
      status?: StatusPayment[];
    },
  ): Promise<PaymentInscription[]>;

  // Agregações e contagens
  abstract countAllFiltered(filters: {
    eventId?: string;
    inscriptionId?: string;
    status?: StatusPayment[];
  }): Promise<number>;
  abstract countAllByEventId(eventId: string): Promise<number>;
  abstract countAllInAnalysis(eventId: string): Promise<number>;
  abstract countAllByInscriptionId(inscriptionId: string): Promise<number>;

  // Atualizações de status
  abstract approvedPayment(id: string): Promise<PaymentInscription>;
  abstract approvePaymentWithTransaction(
    paymentId: string,
  ): Promise<PaymentInscription>;
  abstract rejectedPayment(
    paymentId: string,
    rejectionReason?: string,
  ): Promise<PaymentInscription>;
  abstract revertApprovedPayment(
    paymentId: string,
  ): Promise<PaymentInscription>;
  abstract sumPaidByAccountIdAndEventId(
    accountId: string,
    eventId: string,
  ): Promise<number>;
}
