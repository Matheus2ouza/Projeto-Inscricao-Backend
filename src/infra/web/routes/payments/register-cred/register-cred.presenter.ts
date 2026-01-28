import { RegisterCredOutput } from 'src/usecases/web/payments/register-cred/register-cred.usecase';
import { RegisterCredResponse } from './register-cred.dto';

export class RegisterCredPresenter {
  public static toHttp(output: RegisterCredOutput): RegisterCredResponse {
    return {
      id: output.id,
      link: output.link,
      status: output.status,
    };
  }
}
