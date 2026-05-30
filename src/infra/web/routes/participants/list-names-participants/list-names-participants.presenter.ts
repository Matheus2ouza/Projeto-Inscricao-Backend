import { ListNamesParticipantsOutput } from 'src/usecases/web/participants/list-names-participants/list-names-participants.usecase';
import { ListNamesParticipantsResponse } from './list-names-participants.dto';

export class ListNamesParticipantsPresenter {
  public static toHttp(
    output: ListNamesParticipantsOutput,
  ): ListNamesParticipantsResponse {
    return output.map((participant) => ({
      id: participant.id,
      name: participant.name,
    }));
  }
}
