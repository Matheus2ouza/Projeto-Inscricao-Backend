import { PaymentInstallment } from '../entities/payment-installment.entity';

export abstract class PaymentInstallmentGateway {
  // CRUD básico
  abstract create(
    paymentInstallment: PaymentInstallment,
  ): Promise<PaymentInstallment>;
  abstract deleteMany(paymentId: string): Promise<void>;

  // Buscas por identificador único
  abstract findById(id: string): Promise<PaymentInstallment | null>;

  // Buscas por relacionamento
  abstract findByAsaasPaymentId(
    asaasPaymentId: string,
  ): Promise<PaymentInstallment | null>;
  abstract findByPaymentId(paymentId: string): Promise<PaymentInstallment[]>;
}
