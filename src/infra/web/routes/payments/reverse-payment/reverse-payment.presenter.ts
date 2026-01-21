import { ReversePaymentOutput } from 'src/usecases/web/payments/reverse-payment/reverse-payment.usecase';
import { ReversePaymentResponse } from './reverse-payment.dto';

export class ReversePaymentPresenter {
  public static toHttp(output: ReversePaymentOutput): ReversePaymentResponse {
    return {
      id: output.id,
      status: output.status,
    };
  }
}
