import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';

export type ReceiveSyncOnSiteParticipantBody = {
  onSiteParticipant: OnSiteParticipant;
};

export type ReceiveSyncOnSiteParticipantResponse = {
  id: string;
  operation: 'created' | 'updated';
};
