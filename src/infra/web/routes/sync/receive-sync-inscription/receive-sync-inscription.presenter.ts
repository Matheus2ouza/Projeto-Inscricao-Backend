import { ReceiveSyncInscriptionOutput } from 'src/usecases/web/sync/receive-sync-inscription/receive-sync-inscription.usecase';
import { ReceiveSyncInscriptionResponse } from './receive-sync-inscription.dto';

export class ReceiveSyncInscriptionPresenter {
  public static toHttp(
    output: ReceiveSyncInscriptionOutput,
  ): ReceiveSyncInscriptionResponse {
    return {
      id: output.id,
      operation: output.operation,
    };
  }
}
