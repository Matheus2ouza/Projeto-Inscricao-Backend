import { SyncQueueTable } from './sync.queue';

export type SyncTableConfig = {
  table: SyncQueueTable;
  prismaModel: string;
};

export const SYNC_TABLES_CONFIG: SyncTableConfig[] = [
  { table: 'inscriptions', prismaModel: 'inscription' },
  { table: 'participants', prismaModel: 'participant' },
  { table: 'payments', prismaModel: 'payment' },
];
