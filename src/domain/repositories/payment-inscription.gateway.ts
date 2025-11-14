import { PaymentInscription } from '../entities/payment-inscription';

export abstract class PaymentInscriptionGateway {
  abstract create(
    paymentInscription: PaymentInscription,
  ): Promise<PaymentInscription>;
  abstract findById(id: string): Promise<PaymentInscription | null>;
  abstract findbyInscriptionId(id: string): Promise<PaymentInscription[]>;
  abstract findToAnalysis(
    id: string,
    filters: {
      status?: string[];
      page: number;
      pageSize: number;
    },
  ): Promise<PaymentInscription[]>;
  abstract countAllFiltered(filters: {
    inscriptionId: string;
    status?: string[];
  }): Promise<number>;
  abstract countAllByEvent(eventId: string): Promise<number>;
  abstract countAllInAnalysis(eventId: string): Promise<number>;
  abstract countAllByInscriptionId(inscriptionId: string): Promise<number>;

  abstract approvedPayment(id: string): Promise<PaymentInscription>;

  /**
   * Aprova o pagamento com transação atômica.
   * Executa todas as operações necessárias:
   * - Decrementa o valor da inscrição
   * - Cria movimento financeiro
   * - Incrementa valor arrecadado no evento
   * - Atualiza status do pagamento para APPROVED
   * Se alguma operação falhar, todas são revertidas.
   */
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
  abstract deletePayment(paymentId: string): Promise<void>;
}
