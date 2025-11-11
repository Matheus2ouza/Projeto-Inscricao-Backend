import { FindAllWithInscriptionsOutput } from 'src/usecases/event/find-all-with-inscriptions/find-all-with-inscriptions.usecase';
import { FindAllWithInscriptionsResponse } from './find-all-with-inscriptions.dto';

export class FindAllWithInscriptionsPresenter {
  public static toHttp(
    output: FindAllWithInscriptionsOutput,
  ): FindAllWithInscriptionsResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
