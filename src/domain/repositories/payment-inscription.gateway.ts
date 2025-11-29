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
  abstract findToAnalysis(
    id: string,
    filters: {
      status?: string[];
      page: number;
      pageSize: number;
    },
  ): Promise<PaymentInscription[]>;

  // Agregações e contagens
  abstract countAllFiltered(filters: {
    inscriptionId: string;
    status?: string[];
  }): Promise<number>;
  abstract countAllByEvent(eventId: string): Promise<number>;
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
