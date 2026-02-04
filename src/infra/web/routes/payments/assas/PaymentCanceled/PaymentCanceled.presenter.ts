import { PaymentCanceledOutput } from 'src/usecases/web/payments/asaas/PaymentCanceled/paymentCanceled.usecase';
import { PaymentCanceledResponse } from './paymentCanceled.dto';

export class PaymentCanceledPresenter {
  public static toHttp(output: PaymentCanceledOutput): PaymentCanceledResponse {
    return {
      status: output.status,
      message: output.message,
    };
  }
}
