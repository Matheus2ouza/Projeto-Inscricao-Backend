import Decimal from 'decimal.js';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import PaymentInstallmentPrismaModel from '../payment-installment.prisma.model';

export class PaymentInstallmentEntityToPrismaModelMapper {
  public static map(entity: PaymentInstallment): PaymentInstallmentPrismaModel {
    return {
      id: entity.getId(),
      paymentId: entity.getPaymentId(),
      installmentNumber: entity.getInstallmentNumber(),
      value: Decimal(entity.getValue()),
      netValue: Decimal(entity.getNetValue()),
      asaasPaymentId: entity.getAsaasPaymentId(),
      financialMovementId: entity.getFinancialMovementId() ?? null,
      paidAt: entity.getPaidAt(),
      createdAt: entity.getCreatedAt(),
    };
  }
}
