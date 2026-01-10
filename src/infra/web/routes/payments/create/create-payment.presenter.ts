import { CreatePaymentOutput } from 'src/usecases/web/payments/create/create-payment.usecase';
import { CreatePaymentResponse } from './create-payment.dto';

export class CreatePaymentPresenter {
  public static toHttp(output: CreatePaymentOutput): CreatePaymentResponse {
    return {
      id: output.id,
    };
  }
}
