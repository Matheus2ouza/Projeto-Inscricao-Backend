import { ReceiveSyncOnSiteRegistrationOutput } from 'src/usecases/web/sync/receive-sync-on-site-registration/receive-sync-on-site-registration.usecase';
import { ReceiveSyncOnSiteRegistrationResponse } from './receive-sync-on-site-registration.dto';

export class ReceiveSyncOnSiteRegistrationPresenter {
  public static toHttp(
    output: ReceiveSyncOnSiteRegistrationOutput,
  ): ReceiveSyncOnSiteRegistrationResponse {
    return {
      id: output.id,
      operation: output.operation,
    };
  }
}
