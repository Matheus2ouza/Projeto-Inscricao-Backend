import Decimal from 'decimal.js';
import { Payment } from 'src/domain/entities/payment.entity';
import PaymentPrismaModel from '../payment.prisma.model';

export class PaymentEntityToPaymentPrismaModelMapper {
  public static map(payment: Payment): PaymentPrismaModel {
    return {
      id: payment.getId(),
      eventId: payment.getEventId(),
      accountId: payment.getAccountId() || null,
      guestEmail: payment.getGuestEmail() || null,
      accessToken: payment.getAccessToken() || null,
      isGuest: payment.getIsGuest() || false,
      status: payment.getStatus(),
      methodPayment: payment.getMethodPayment(),
      totalValue: Decimal(payment.getTotalValue()),
      totalPaid: Decimal(payment.getTotalPaid()),
      totalNetValue: Decimal(payment.getTotalNetValue()),
      installments: payment.getInstallments() || null,
      paidInstallments: payment.getPaidInstallments(),
      rejectionReason: payment.getRejectionReason() || null,
      imageUrl: payment.getImageUrl() || null,
      asaasCheckoutId: payment.getAsaasCheckoutId() || null,
      externalReference: payment.getExternalReference() || null,
      approvedBy: payment.getApprovedBy() || null,
      createdAt: payment.getCreatedAt(),
      updatedAt: payment.getUpdatedAt(),
    };
  }
}
