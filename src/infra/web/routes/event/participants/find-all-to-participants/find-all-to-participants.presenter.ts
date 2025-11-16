import { FindAllToParticipantsOutput } from 'src/usecases/web/event/participants/find-all-to-participants/find-all-to-participants.usecase';
import { FindAllToParticipantsResponse } from './find-all-to-participants.dto';

export class FindAllToParticipantsPresenter {
  public static toHttp(
    output: FindAllToParticipantsOutput,
  ): FindAllToParticipantsResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
