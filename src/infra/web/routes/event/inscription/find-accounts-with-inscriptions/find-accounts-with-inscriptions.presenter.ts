import { FindAccountWithInscriptionsOutput } from 'src/usecases/web/event/inscription/find-accounts-with-inscriptions.usecase';
import { FindAccountWithInscriptionsResponse } from './find-accounts-with-inscriptions.dto';

export class FindAccountWithInscriptionsPresenter {
  public static toHttp(
    output: FindAccountWithInscriptionsOutput,
  ): FindAccountWithInscriptionsResponse {
    return {
      accounts: output.accounts,
    };
  }
}
