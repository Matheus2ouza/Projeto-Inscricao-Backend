import { FindAllWithParticipantsOutput } from 'src/usecases/web/event/find-all-with-participants/find-all-with-participants.usecase';
import { FindAllWithParticipantsResponse } from './find-all-with-participants.dto';

export class FindAllWithParticipantsPresenter {
  public static toHttp(
    output: FindAllWithParticipantsOutput,
  ): FindAllWithParticipantsResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
