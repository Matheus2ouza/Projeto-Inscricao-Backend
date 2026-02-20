import { PaymentCanceledOutput } from 'src/usecases/web/payments/asaas/payment-canceled/payment-canceled.usecase';
import { PaymentCanceledResponse } from './payment-canceled.dto';

export class PaymentCanceledPresenter {
  public static toHttp(output: PaymentCanceledOutput): PaymentCanceledResponse {
    return {
      status: output.status,
      message: output.message,
    };
  }
}
