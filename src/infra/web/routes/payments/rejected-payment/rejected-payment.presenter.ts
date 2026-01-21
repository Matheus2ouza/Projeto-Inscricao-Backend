import { RejectedPaymentOutput } from 'src/usecases/web/payments/rejected-payment/rejected-payment.usecase';
import { RejectedPaymentResponse } from './rejected-payment.dto';

export class RejectedPaymentPresenter {
  public static toHttp(output: RejectedPaymentOutput): RejectedPaymentResponse {
    return {
      id: output.id,
      status: output.status,
    };
  }
}
