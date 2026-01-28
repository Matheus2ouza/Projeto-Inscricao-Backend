import { PaymentInstallment } from '../entities/payment-installment.entity';

export abstract class PaymentInstallmentGateway {
  abstract create(
    paymentInstallment: PaymentInstallment,
  ): Promise<PaymentInstallment>;

  abstract findById(id: string): Promise<PaymentInstallment | null>;
  abstract findByAsaasPaymentId(
    asaasPaymentId: string,
  ): Promise<PaymentInstallment | null>;
}
