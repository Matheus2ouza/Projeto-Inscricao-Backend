import { ApprovePaymentOutput } from 'src/usecases/web/paymentInscription/analysis/update-status-payment/approve-payment.usecase';
import { UpdatePaymentResponse } from './update-payment.dto';

export class ApprovePaymentPresenter {
  public static toHttp(output: ApprovePaymentOutput): UpdatePaymentResponse {
    return {
      id: output.id,
      status: output.status,
    };
  }
}
