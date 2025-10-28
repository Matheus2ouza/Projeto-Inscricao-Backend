import { PaymentInscription } from '../entities/payment-inscription';

export abstract class PaymentInscriptionGateway {
  abstract create(
    paymentInscription: PaymentInscription,
  ): Promise<PaymentInscription>;
  abstract findById(id: string): Promise<PaymentInscription | null>;
  abstract findbyInscriptionId(id: string): Promise<PaymentInscription[]>;
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
}
