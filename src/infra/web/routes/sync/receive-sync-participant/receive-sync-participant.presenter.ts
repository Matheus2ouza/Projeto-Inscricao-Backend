import { ReceiveSyncParticipantOutput } from 'src/usecases/web/sync/receive-sync-participant/receive-sync-participant.usecase';
import { ReceiveSyncParticipantResponse } from './receive-sync-participant.dto';

export class ReceiveSyncParticipantPresenter {
  public static toHttp(
    output: ReceiveSyncParticipantOutput,
  ): ReceiveSyncParticipantResponse {
    return {
      id: output.id,
      operation: output.operation,
    };
  }
}
