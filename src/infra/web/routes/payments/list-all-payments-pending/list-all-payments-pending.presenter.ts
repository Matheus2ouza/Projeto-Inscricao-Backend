import { ListAllPaymentsPendingOutput } from 'src/usecases/web/payments/list-all-payments-pending/list-all-payments-pending.usecase';
import { ListAllPaymentsPendingResponse } from './list-all-payments-pending.dto';

export class ListAllPaymentsPendingPresenter {
  public static toHttp(
    output: ListAllPaymentsPendingOutput,
  ): ListAllPaymentsPendingResponse {
    return {
      inscriptions: output.inscriptions,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
