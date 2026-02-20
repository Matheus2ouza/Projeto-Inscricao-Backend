// src/infra/web/routes/webhooks/asaas/presenter/confirmPayment.presenter.ts

import { ConfirmPaymentOutput } from 'src/usecases/web/payments/asaas/confirm-payment/confirm-payment.usecase';
import { ConfirmPaymentResponse } from './confirm-payment.dto';

export class ConfirmPaymentPresenter {
  public static toHttp(output: ConfirmPaymentOutput): ConfirmPaymentResponse {
    return {
      id: output.id,
      status: output.status,
    };
  }

  public static toEventReceived(event: string): ConfirmPaymentResponse {
    return {
      id: '',
      status: 'EVENT_RECEIVED',
    };
  }
}
