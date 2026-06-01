import { ReceiveSyncOnSiteParticipantPaymentOutput } from 'src/usecases/web/sync/receive-sync-on-site-participant-payment/receive-sync-on-site-participant-payment.usecase';
import { ReceiveSyncOnSiteParticipantPaymentResponse } from './receive-sync-on-site-participant-payment.dto';

export class ReceiveSyncOnSiteParticipantPaymentPresenter {
  public static toHttp(
    output: ReceiveSyncOnSiteParticipantPaymentOutput,
  ): ReceiveSyncOnSiteParticipantPaymentResponse {
    return {
      id: output.id,
      operation: output.operation,
    };
  }
}
