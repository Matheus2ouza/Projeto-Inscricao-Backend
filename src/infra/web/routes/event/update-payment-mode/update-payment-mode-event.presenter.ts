import { UpdatePaymentModeEventOutput } from 'src/usecases/web/event/update-payment-mode/update-payment-mode-event.usecase';
import { UpdatePaymentModeEventResponse } from './update-payment-mode-event.dto';

export class UpdatePaymentModeEventPresenter {
  public static toHttp(
    output: UpdatePaymentModeEventOutput,
  ): UpdatePaymentModeEventResponse {
    return {
      message: output.message,
      paymentMode: output.paymentMode,
    };
  }
}
