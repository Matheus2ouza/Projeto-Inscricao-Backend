import { RegisterPaymentOutput } from 'src/usecases/web/payments/register/register-payment.usecase';
import { RegisterPaymentResponse } from './register-payment.dto';

export class RegisterPaymentPresenter {
  public static toHttp(output: RegisterPaymentOutput): RegisterPaymentResponse {
    return {
      id: output.id,
      totalValue: output.totalValue,
      status: output.status,
      createdAt: output.createdAt,
    };
  }
}
