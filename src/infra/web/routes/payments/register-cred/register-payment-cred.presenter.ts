import { RegisterPaymentCredOutput } from 'src/usecases/web/payments/register-cred/register-payment-cred.usecase';
import { RegisterPaymentCredResponse } from './register-payment-cred.dto';

export class RegisterPaymentCredPresenter {
  public static toHttp(
    output: RegisterPaymentCredOutput,
  ): RegisterPaymentCredResponse {
    return {
      id: output.id,
      link: output.link,
      status: output.status,
    };
  }
}
