import { SyncParticipantRecord } from './receive-sync-participant.mapper';

export type ReceiveSyncParticipantBody = {
  record: SyncParticipantRecord;
};

export type ReceiveSyncParticipantResponse = {
  id: string;
  operation: 'created' | 'updated';
};
