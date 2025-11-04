import { UpdatePaymentOutput } from 'src/usecases/paymentInscription/analysis/update-status-payment/update-payment.usecase';
import { UpdatePaymentResponse } from './update-payment.dto';

export class ApprovePaymentPresenter {
  public static toHttp(output: UpdatePaymentOutput): UpdatePaymentResponse {
    return {
      id: output.id,
      status: output.status,
    };
  }
}
