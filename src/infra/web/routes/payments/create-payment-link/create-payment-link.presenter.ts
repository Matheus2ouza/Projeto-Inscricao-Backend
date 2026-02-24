import { CreatePaymentLinkOutput } from 'src/usecases/web/payments/create-payment-link/create-payment-link.usecase';
import { CreatePaymentLinkResponse } from './create-payment-link.dto';

export class CreatePaymentLinkPresenter {
  public static toHttp(
    output: CreatePaymentLinkOutput,
  ): CreatePaymentLinkResponse {
    return {
      url: output.url,
      active: output.active,
    };
  }
}
