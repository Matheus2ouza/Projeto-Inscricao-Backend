import { PaymentInscription } from '../entities/payment-inscription';

export abstract class PaymentInscriptionGateway {
  abstract create(
    paymentInscription: PaymentInscription,
  ): Promise<PaymentInscription>;
  abstract findById(id: string): Promise<PaymentInscription | null>;
  abstract findbyInscriptionId(
    id: string,
  ): Promise<PaymentInscription[] | null>;
}
