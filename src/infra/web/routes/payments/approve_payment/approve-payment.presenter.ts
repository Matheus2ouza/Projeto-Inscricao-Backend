import { ApprovePaymentOutput } from 'src/usecases/web/payments/approve-payment/approve-payment.usecase';
import { ApprovePaymentResponse } from './approve-payment.dto';

export class ApprovePaymentPresenter {
  static toHttp(output: ApprovePaymentOutput): ApprovePaymentResponse {
    return {
      id: output.id,
      status: output.status,
    };
  }
}
