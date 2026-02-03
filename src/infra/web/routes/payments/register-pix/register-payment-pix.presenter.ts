import { RegisterPaymentPixOutput } from 'src/usecases/web/payments/register-pix/register-payment-pix.usecase';
import { RegisterPaymentPixResponse } from './register-payment-pix.dto';

export class RegisterPaymentPixPresenter {
  public static toHttp(
    output: RegisterPaymentPixOutput,
  ): RegisterPaymentPixResponse {
    return {
      id: output.id,
      totalValue: output.totalValue,
      status: output.status,
      createdAt: output.createdAt,
    };
  }
}
