import { FindAllWithTicketsOutput } from 'src/usecases/web/event/find-all-with-tickets/find-all-with-tickets.usecase';

import { FindAllWithTicketsResponse } from './find-all-with-tickets.dto';

export class FindAllWithTicketsPresenter {
  public static toHttp(
    output: FindAllWithTicketsOutput,
  ): FindAllWithTicketsResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
