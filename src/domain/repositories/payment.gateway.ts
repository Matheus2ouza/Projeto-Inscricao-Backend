import { Payment } from '../entities/payment.entity';

export abstract class PaymentGateway {
  // CRUD básico
  abstract create(payment: Payment): Promise<Payment>;
}
