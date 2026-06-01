import { ReceiveSyncOnSiteParticipantOutput } from 'src/usecases/web/sync/receive-sync-on-site-participant/receive-sync-on-site-participant.usecase';
import { ReceiveSyncOnSiteParticipantResponse } from './receive-sync-on-site-participant.dto';

export class ReceiveSyncOnSiteParticipantPresenter {
  public static toHttp(
    output: ReceiveSyncOnSiteParticipantOutput,
  ): ReceiveSyncOnSiteParticipantResponse {
    return {
      id: output.id,
      operation: output.operation,
    };
  }
}
