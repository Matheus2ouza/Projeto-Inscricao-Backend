import { UpdateGuestInscriptionOutput } from 'src/usecases/web/inscription/update-guest-inscription/update-guest-inscription.usecase';
import { UpdateGuestInscriptionResponse } from './update-guest-inscription.dto';

export class UpdateGuestInscriptionPresenter {
  public static toHttp(
    output: UpdateGuestInscriptionOutput,
  ): UpdateGuestInscriptionResponse {
    return {
      id: output.id,
    };
  }
}
