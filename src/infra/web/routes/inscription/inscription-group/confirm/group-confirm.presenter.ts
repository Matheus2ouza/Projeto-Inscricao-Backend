import { GroupConfirmOutput } from 'src/usecases/inscription/group/confirm/group-confirm.usecase';
import { GroupConfirmRouteResponse } from './group-confirm.dto';

export class GroupConfirmPresenter {
  public static toHttp(input: GroupConfirmOutput): GroupConfirmRouteResponse {
    const response: GroupConfirmRouteResponse = {
      inscriptionId: input.inscriptionId,
      inscriptionStatus: input.inscriptionStatus,
      paymentEnabled: input.paymentEnabled,
    };
    return response;
  }
}
