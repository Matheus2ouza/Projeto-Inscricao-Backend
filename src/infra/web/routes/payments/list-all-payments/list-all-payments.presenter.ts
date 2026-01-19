import { ListAllPaymentsOutput } from 'src/usecases/web/payments/list-all-payments/list-all-payments.usecase';
import { ListAllPaymentsResponse } from './list-all-payments.dto';

export class ListAllPaymentsPresenter {
  public static toHttp(output: ListAllPaymentsOutput): ListAllPaymentsResponse {
    return {
      summary: output.summary,
      payments: output.payments,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
