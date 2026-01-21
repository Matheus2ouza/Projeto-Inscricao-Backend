import { ListPaymentPendingDetailsOutput } from 'src/usecases/web/payments/list-payment-pending-details/list-payment-pending-details.usecase';
import { ListPaymentPendingDetailsResponse } from './list-payment-pending-details.dto';

export class ListPaymentDetailsPresenter {
  public static toResponse(
    output: ListPaymentPendingDetailsOutput,
  ): ListPaymentPendingDetailsResponse {
    return {
      inscription: output.inscription,
      participant: output.participant,
      payments: output.payments,
      allowCard: output.allowCard,
      totalParticipant: output.totalParticipant,
      totalPayment: output.totalPayment,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
