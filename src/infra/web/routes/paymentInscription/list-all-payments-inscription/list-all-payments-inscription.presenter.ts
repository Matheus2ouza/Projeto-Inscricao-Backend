import { ListAllPaymentsInscriptionOutput } from 'src/usecases/web/paymentInscription/list-all-payments-inscription/list-all-payments-inscription.usecase';
import { ListAllPaymentsInscriptionResponse } from './list-all-payments-inscription.dto';

export class ListAllPaymentsInscriptionPresenter {
  public static toHttp(
    output: ListAllPaymentsInscriptionOutput,
  ): ListAllPaymentsInscriptionResponse {
    return {
      paymentsInscriptions: output.paymentsInscriptions,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
