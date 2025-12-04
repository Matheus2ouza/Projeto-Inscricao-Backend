import { ListParticipantsOutput } from 'src/usecases/web/participants/list-participants/list-participants.usecase';
import { ListParticipantsResponse } from './list-participants.dto';

export class ListParticipantsPresenter {
  public static toHttp(
    output: ListParticipantsOutput,
  ): ListParticipantsResponse {
    return {
      account: output.account,
      countAccounts: output.countAccounts,
      countParticipants: output.countParticipants,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
