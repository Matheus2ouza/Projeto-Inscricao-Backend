import { ConfirmGroupOutput } from 'src/usecases/inscription/group/confirm-group.usecase';
import { GroupConfirmRouteResponse } from './group-confirm.dto';

export class GroupConfirmPresenter {
  public static toHttp(input: ConfirmGroupOutput): GroupConfirmRouteResponse {
    const response: GroupConfirmRouteResponse = {
      inscriptionId: input.inscriptionId,
      totalParticipants: input.totalParticipants,
    };
    return response;
  }
}
