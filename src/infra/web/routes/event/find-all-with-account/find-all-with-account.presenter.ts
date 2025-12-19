import { FindAllWithAccountOutput } from 'src/usecases/web/event/find-all-with-account/find-all-with-account.usecase';
import { FindAllWithAccountResponse } from './find-all-with-account.dto';

export class FindAllWithAccountPresenter {
  public static toHttp(
    output: FindAllWithAccountOutput,
  ): FindAllWithAccountResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
