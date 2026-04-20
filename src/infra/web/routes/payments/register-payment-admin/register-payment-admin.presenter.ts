import { RegisterPaymentAdminOutput } from 'src/usecases/web/payments/register-payment-admin/register-payment-admin.usecase';
import { RegisterPaymentAdminResponse } from './register-payment-admin.dto';

export class RegisterPaymentAdminPresenter {
  public static toHttp(
    output: RegisterPaymentAdminOutput,
  ): RegisterPaymentAdminResponse {
    return {
      inscriptions: output.inscriptions.map((inscription) => ({
        id: inscription.id,
        status: inscription.status,
      })),
    };
  }
}
