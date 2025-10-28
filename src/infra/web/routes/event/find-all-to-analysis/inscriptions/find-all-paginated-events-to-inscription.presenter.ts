import { FindAllPaginatedEventToInscriptionOutput } from 'src/usecases/event/find-all-to-analysis/inscriptions/find-all-paginated-events-to-inscription.usecase';
import { FindAllPaginatedEventToInscriptionResponse } from './find-all-paginated-events-to-inscription.dto';

export class FindAllPaginatedEventToInscriptionPresenter {
  public static toHttp(
    input: FindAllPaginatedEventToInscriptionOutput,
  ): FindAllPaginatedEventToInscriptionResponse {
    return {
      events: input.events,
      total: input.total,
      page: input.page,
      pageCount: input.pageCount,
    };
  }
}
