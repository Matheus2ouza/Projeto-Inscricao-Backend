import { FindAccountsDetailsOutput } from 'src/usecases/web/event/check-in/find-accounts-details/find-accounts-details.usecase';
import { FindAccountsDetailsResponse } from './find-accounts-details.dto';

export class FindAccountsDetailsPresenter {
  public static toHttp(
    output: FindAccountsDetailsOutput,
  ): FindAccountsDetailsResponse {
    return {
      id: output.id,
      username: output.username,
      email: output.email,
      status: output.status,
      countDebt: output.countDebt,
      countPay: output.countPay,
      countInscriptions: output.countInscriptions,
      inscriptions: output.inscriptions,
    };
  }
}
