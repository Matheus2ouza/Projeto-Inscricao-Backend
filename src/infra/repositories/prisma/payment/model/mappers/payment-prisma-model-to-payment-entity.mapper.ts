import { Payment } from 'src/domain/entities/payment.entity';
import PaymentPrismaModel from '../payment.prisma.model';

export class PaymentPrismaModelToPaymentEntityMapper {
  public static map(payment: PaymentPrismaModel): Payment {
    return Payment.with({
      id: payment.id,
      eventId: payment.eventId,
      accountId: payment.accountId || undefined,
      guestName: payment.guestName || undefined,
      guestEmail: payment.guestEmail || undefined,
      accessToken: payment.accessToken || undefined,
      isGuest: payment.isGuest || false,
      status: payment.status,
      methodPayment: payment.methodPayment,
      totalValue: Number(payment.totalValue),
      totalPaid: Number(payment.totalPaid),
      totalNetValue: Number(payment.totalNetValue),
      totalReceived: Number(payment.totalReceived),
      installments: payment.installments || 1,
      paidInstallments: payment.paidInstallments || 0,
      imageUrl: payment.imageUrl || undefined,
      asaasCheckoutId: payment.asaasCheckoutId || undefined,
      externalReference: payment.externalReference || undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      rejectionReason: payment.rejectionReason || undefined,
      approvedBy: payment.approvedBy || undefined,
    });
  }
}
