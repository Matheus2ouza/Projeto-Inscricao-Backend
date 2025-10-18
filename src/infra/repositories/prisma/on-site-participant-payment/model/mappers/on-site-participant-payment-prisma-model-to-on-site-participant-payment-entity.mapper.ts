import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import OnSiteParticipantPaymentPrismaModel from '../on-site-participant-payment.prisma.model';

export class OnSiteParticipantPaymentPrismaModelToOnSiteParticipantPaymentEntityMapper {
  public static map(
    payment: OnSiteParticipantPaymentPrismaModel,
  ): OnSiteParticipantPayment {
    return OnSiteParticipantPayment.with({
      id: payment.id,
      participantId: payment.participantId,
      paymentMethod: payment.paymentMethod,
      value: payment.value,
      createdAt: payment.createdAt,
    });
  }
}
