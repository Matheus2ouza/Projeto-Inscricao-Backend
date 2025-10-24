import { ConfirmIndivOutput } from 'src/usecases/inscription/indiv/confirm-indiv.usecase';
import { ConfirmIndivRouteResponse } from './indiv-confirm.dto';

export class IndivConfirmPresenter {
  public static toHttp(input: ConfirmIndivOutput): ConfirmIndivRouteResponse {
    const response: ConfirmIndivRouteResponse = {
      inscriptionId: input.inscriptionId,
      inscriptionStatus: input.inscriptionStatus,
      paymentEnabled: input.paymentEnabled,
    };
    return response;
  }
}
