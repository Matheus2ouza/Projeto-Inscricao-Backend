import { UpdateParticipantsOutput } from 'src/usecases/web/participants/update/update-participants.usecase';
import { UpdateParticipantsResponse } from './update-participants.dto';

export class UpdateParticipantsPresenter {
  public static toHttp(
    output: UpdateParticipantsOutput,
  ): UpdateParticipantsResponse {
    const response: UpdateParticipantsResponse = {
      id: output.id,
    };
    return response;
  }
}
