import { UpdatePaymentOutput } from 'src/usecases/event/update-payment/update-payment.usecase';
import { UpdatePaymentEventResponse } from './update-payment-event.dto';

export class UpdatePaymentEventPresenter {
  public static toHttp(input: UpdatePaymentOutput): UpdatePaymentEventResponse {
    const response: UpdatePaymentEventResponse = {
      id: input.id,
      paymentStatus: input.paymentStatus,
    };
    return response;
  }
}
