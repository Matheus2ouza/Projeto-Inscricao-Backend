import { Payment } from 'src/domain/entities/payment.entity';
import PaymentPrismaModel from '../payment.prisma.model';

export class PaymentPrismaModelToPaymentEntityMapper {
  public static map(payment: PaymentPrismaModel): Payment {
    return Payment.with({
      id: payment.id,
      eventId: payment.eventId,
      accountId: payment.accountId,
      status: payment.status,
      totalValue: Number(payment.totalValue),
      imageUrl: payment.imageUrl,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      rejectionReason: payment.rejectionReason || undefined,
      financialMovementId: payment.financialMovementId || undefined,
      approvedBy: payment.approvedBy || undefined,
    });
  }
}
