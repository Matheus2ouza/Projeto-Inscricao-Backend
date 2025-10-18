import { OnSiteParticipantPayment } from '../entities/on-site-participant-payment.entity';

export abstract class OnSiteParticipantPaymentGateway {
  abstract create(
    payment: OnSiteParticipantPayment,
  ): Promise<OnSiteParticipantPayment>;

  abstract findById(
    id: string,
  ): Promise<OnSiteParticipantPayment | null>;

  abstract findByParticipantId(
    participantId: string,
  ): Promise<OnSiteParticipantPayment[]>;
}
