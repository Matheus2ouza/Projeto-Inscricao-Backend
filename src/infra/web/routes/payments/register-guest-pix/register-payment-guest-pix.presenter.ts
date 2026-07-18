import { RegisterPaymentGuestPixOutput } from 'src/usecases/web/payments/register-guest-pix/register-payment-guest-pix.usecase';
import { RegisterPaymentGuestPixResponse } from './register-payment-guest-pix.dto';

export class RegisterPaymentGuestPixPresenter {
  public static toHttp(
    output: RegisterPaymentGuestPixOutput,
  ): RegisterPaymentGuestPixResponse {
    return {
      id: output.id,
      status: output.status,
      confirmationCode: output.confirmationCode,
    };
  }
}
