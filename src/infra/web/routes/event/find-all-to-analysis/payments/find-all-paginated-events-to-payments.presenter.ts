import { FindAllPaginatedEventToPaymentOutput } from 'src/usecases/web/event/find-all-to-analysis/payments/find-all-paginated-events-to-payment.usecase';
import { FindAllPaginatedEventToPaymentResponse } from './find-all-paginated-events-to-payments.dto';

export class FindAllPaginatedEventToPaymentPresenter {
  public static toHttp(
    output: FindAllPaginatedEventToPaymentOutput,
  ): FindAllPaginatedEventToPaymentResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
