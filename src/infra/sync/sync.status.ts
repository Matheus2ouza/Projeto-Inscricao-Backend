export interface SyncStatus {
  online: boolean;
  syncing: boolean;
  mode: 'EVENT' | 'PROD';
  lastSync: Date | null;
}
