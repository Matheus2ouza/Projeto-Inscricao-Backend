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
      totalValue: Decimal(payment.getTotalValue()),
      rejectionReason: payment.getRejectionReason() || null,
      imageUrl: payment.getImageUrl(),
      financialMovementId: payment.getFinancialMovementId() || null,
      approvedBy: payment.getApprovedBy() || null,
      createdAt: payment.getCreatedAt(),
      updatedAt: payment.getUpdatedAt(),
    };
  }
}
