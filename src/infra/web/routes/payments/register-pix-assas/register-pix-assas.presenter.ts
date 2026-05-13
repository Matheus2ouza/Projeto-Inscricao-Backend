import { RegisterPaymentPixAssasOutput } from 'src/usecases/web/payments/register-pix-assas/register-payment-pix-assas.usecase';
import { RegisterPaymentPixAssasResponse } from './register-pix-assas.dto';

export class RegisterPaymentPixAssasPresenter {
  public static toHttp(
    output: RegisterPaymentPixAssasOutput,
  ): RegisterPaymentPixAssasResponse {
    return {
      id: output.id,
      link: output.link,
      status: output.status,
    };
  }
}
