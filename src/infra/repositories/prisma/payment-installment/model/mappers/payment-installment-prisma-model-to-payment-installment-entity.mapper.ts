import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import PaymentInstallmentPrismaModel from '../payment-installment.prisma.model';

export class PaymentInstallmentPrismaModelToEntityMapper {
  public static map(
    paymentInstallment: PaymentInstallmentPrismaModel,
  ): PaymentInstallment {
    return PaymentInstallment.with({
      id: paymentInstallment.id,
      paymentId: paymentInstallment.paymentId,
      installmentNumber: paymentInstallment.installmentNumber,
      value: Number(paymentInstallment.value),
      netValue: Number(paymentInstallment.netValue),
      asaasPaymentId: paymentInstallment.asaasPaymentId || undefined,
      financialMovementId: paymentInstallment.financialMovementId || undefined,
      paidAt: paymentInstallment.paidAt,
      createdAt: paymentInstallment.createdAt,
    });
  }
}
