import Decimal from 'decimal.js';
import { StatusPayment } from 'generated/prisma';
import { PaymentInscription } from 'src/domain/entities/payment-inscription';
import PaymentInscriptionPrismaModel from '../payment-inscription.prisma.model';

export class PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper {
  public static map(
    paymentInscription: PaymentInscriptionPrismaModel,
  ): PaymentInscription {
    const anPaymentInscription = PaymentInscription.with({
      id: paymentInscription.id,
      inscriptionId: paymentInscription.inscriptionId,
      eventId: paymentInscription.eventId,
      accountId: paymentInscription.accountId,
      status: paymentInscription.status as unknown as StatusPayment,
      value: Decimal(paymentInscription.value),
      imageUrl: paymentInscription.imageUrl,
      createdAt: paymentInscription.createdAt,
      updatedAt: paymentInscription.updatedAt,
      rejectionReason: paymentInscription?.rejectionReason || undefined,
      financialMovementId: paymentInscription?.financialMovementId || undefined,
    });

    return anPaymentInscription;
  }
}
