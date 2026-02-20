import { PaymentReprovedOutput } from 'src/usecases/web/payments/asaas/payment-reproved/payment-reproved.usecase';
import { PaymentReprovedResponse } from './payment-reproved.dto';

export class PaymentReprovedPresenter {
  public static toHttp(output: PaymentReprovedOutput): PaymentReprovedResponse {
    return {
      status: output.status,
      message: output.message,
    };
  }
}
