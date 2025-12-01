import { FindAllWithPaymentsOutput } from 'src/usecases/web/event/find-all-with-payments/find-all-with-payments.usecase';
import { FindAllWithPaymentsResponse } from './find-all-with-payments.dto';

export class FindAllWithPaymentsPresenter {
  public static toHttp(
    output: FindAllWithPaymentsOutput,
  ): FindAllWithPaymentsResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
