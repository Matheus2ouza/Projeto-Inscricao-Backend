import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';

export type ReceiveSyncOnSiteParticipantPaymentBody = {
  onSiteParticipantPayment: OnSiteParticipantPayment;
};

export type ReceiveSyncOnSiteParticipantPaymentResponse = {
  id: string;
  operation: 'created' | 'updated';
};
