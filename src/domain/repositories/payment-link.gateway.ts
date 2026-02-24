import { PaymentLink } from '../entities/payment-link.entity';

export abstract class PaymentLinkGateway {
  // CRUD básico
  abstract create(paymentLink: PaymentLink): Promise<PaymentLink>;

  // Buscas e listagens
  abstract findById(id: string): Promise<PaymentLink | null>;
  abstract findByPaymentId(paymentId: string): Promise<PaymentLink | null>;
}
