import { PaymentDetailsOutput } from 'src/usecases/web/paymentInscription/payment-details/payment-details.usecase';
import { PaymentDetailsResponse } from './payment-details.dto';

export class PaymentDetailsPresenter {
  public static toHttp(output: PaymentDetailsOutput): PaymentDetailsResponse {
    return {
      inscription: {
        ...output.inscription,
      },
    };
  }
}
