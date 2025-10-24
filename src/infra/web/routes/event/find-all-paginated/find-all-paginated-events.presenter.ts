import { FindAllPaginatedEventsOutput } from 'src/usecases/event/find-all-event/find-all-paginated-events.usecase';
import { FindAllPaginatedEventResponse } from './find-all-paginated-events.dto';

export class FindAllPaginatedEventsPresenter {
  public static toHttp(
    input: FindAllPaginatedEventsOutput,
  ): FindAllPaginatedEventResponse {
    return {
      events: input.events,
      total: input.total,
      page: input.page,
      pageCount: input.pageCount,
    };
  }
}
