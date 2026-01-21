import Decimal from 'decimal.js';
import { Payment } from 'src/domain/entities/payment.entity';
import PaymentPrismaModel from '../payment.prisma.model';

export class PaymentEntityToPaymentPrismaModelMapper {
  public static map(payment: Payment): PaymentPrismaModel {
    return {
      id: payment.getId(),
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      status: payment.getStatus(),
      methodPayment: payment.getMethodPayment(),
      totalValue: Decimal(payment.getTotalValue()),
      rejectionReason: payment.getRejectionReason() || null,
      imageUrl: payment.getImageUrl() || null,
      financialMovementId: payment.getFinancialMovementId() || null,
      approvedBy: payment.getApprovedBy() || null,
      createdAt: payment.getCreatedAt(),
      updatedAt: payment.getUpdatedAt(),
    };
  }
}
