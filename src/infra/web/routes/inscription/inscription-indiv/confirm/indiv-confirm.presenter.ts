import { IndivConfirmOutput } from 'src/usecases/web/inscription/indiv/confirm/indiv-confirm.usecase';
import { ConfirmIndivRouteResponse } from './indiv-confirm.dto';

export class IndivConfirmPresenter {
  public static toHttp(input: IndivConfirmOutput): ConfirmIndivRouteResponse {
    const response: ConfirmIndivRouteResponse = {
      inscriptionId: input.inscriptionId,
      inscriptionStatus: input.inscriptionStatus,
      paymentEnabled: input.paymentEnabled,
    };
    return response;
  }
}
