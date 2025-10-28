import { ApprovePaymentOutput } from 'src/usecases/paymentInscription/analysis/update-status-payment/approve-payment.usecase';
import { ApprovePaymentResponse } from './approve-payment.dto';

export class ApprovePaymentPresenter {
  public static toHttp(output: ApprovePaymentOutput): ApprovePaymentResponse {
    return {
      id: output.id,
      status: output.status,
    };
  }
}
