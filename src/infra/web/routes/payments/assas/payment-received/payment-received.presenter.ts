import { PaymentReceivedOutput } from 'src/usecases/web/payments/asaas/payment-received/payment-received.usecase';
import { PaymentReceivedResponse } from './payment-received.dto';

export class PaymentReceivedPresenter {
  public static toHttp(output: PaymentReceivedOutput): PaymentReceivedResponse {
    return {
      status: output.status,
      message: output.message,
    };
  }
}
