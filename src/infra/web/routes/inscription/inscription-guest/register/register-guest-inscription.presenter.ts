import { RegisterGuestInscriptionOutput } from 'src/usecases/web/inscription/guest/register/register-guest-inscription.usecase';
import { RegisterGuestInscriptionResponse } from './register-guest-inscription.dto';

export class RegisterGuestInscriptionPresenter {
  public static toHtpp(
    output: RegisterGuestInscriptionOutput,
  ): RegisterGuestInscriptionResponse {
    return {
      id: output.id,
      status: output.status,
      confirmationCode: output.confirmationCode,
    };
  }
}
