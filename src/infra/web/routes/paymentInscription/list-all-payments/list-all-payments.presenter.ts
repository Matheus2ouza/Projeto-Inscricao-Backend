import { ListAllPaymentsOutput } from 'src/usecases/web/paymentInscription/list-all-payments/list-all-payments.usecase';
import { ListAllPaymentsResponse } from './list-all-payments.dto';

export class ListAllPaymentsPresenter {
  public static toHttp(output: ListAllPaymentsOutput): ListAllPaymentsResponse {
    return {
      paymentsInscriptions: output.paymentsInscriptions,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
