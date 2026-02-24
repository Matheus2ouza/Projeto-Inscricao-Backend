import { FindPaymentsDatesOutput } from 'src/usecases/web/payments/find-payments-dates/find-payments-dates.usecase';
import { FindPaymentsDatesResponse } from './find-payments-dates.dto';

export class FindPaymentsDatesPresenter {
  public static toHttp(
    output: FindPaymentsDatesOutput,
  ): FindPaymentsDatesResponse {
    return output.map((p) => ({
      eventId: p.eventId,
      paymentId: p.paymentId,
      installmentNumber: p.installmentNumber,
      received: p.received,
      value: p.value,
      netValue: p.netValue,
      estimatedAt: p.estimatedAt,
    }));
  }
}
