import { SyncInscriptionRecord } from './receive-sync-inscription.mapper';

export type ReceiveSyncInscriptionBody = {
  record: SyncInscriptionRecord;
};

export type ReceiveSyncInscriptionResponse = {
  id: string;
  operation: 'created';
};
