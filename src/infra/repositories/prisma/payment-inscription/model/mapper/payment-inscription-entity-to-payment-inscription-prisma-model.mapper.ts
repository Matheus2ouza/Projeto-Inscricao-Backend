import { PaymentInscription } from 'src/domain/entities/payment-inscription';
import PaymentInscriptionPrismaModel from '../payment-inscription.prisma.model';

export class PaymentInscriptionEntityToPaymentInscriptionPrismaModelMapper {
  public static map(
    paymentInscription: PaymentInscription,
  ): PaymentInscriptionPrismaModel {
    const aModel: PaymentInscriptionPrismaModel = {
      id: paymentInscription.getId(),
      inscriptionId: paymentInscription.getInscriptionId(),
      eventId: paymentInscription.getEventId(),
      accountId: paymentInscription.getAccountId(),
      status: paymentInscription.getStatus(),
      value: paymentInscription.getValue(),
      imageUrl: paymentInscription.getImageUrl(),
      rejectionReason: paymentInscription.getRejectionReason() ?? null,
      createdAt: paymentInscription.getCreatedAt(),
      updatedAt: paymentInscription.getUpdatedAt(),
    };
    return aModel;
  }
}
