import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import OnSiteParticipantPaymentPrismaModel from '../on-site-participant-payment.prisma.model';

export class OnSiteParticipantPaymentEntityToOnSiteParticipantPaymentPrismaModelMapper {
  public static map(
    payment: OnSiteParticipantPayment,
  ): OnSiteParticipantPaymentPrismaModel {
    const aModel: OnSiteParticipantPaymentPrismaModel = {
      id: payment.getId(),
      participantId: payment.getParticipantId(),
      paymentMethod: payment.getPaymentMethod(),
      value: payment.getValue(),
      createdAt: payment.getCreatedAt(),
    };

    return aModel;
  }
}
