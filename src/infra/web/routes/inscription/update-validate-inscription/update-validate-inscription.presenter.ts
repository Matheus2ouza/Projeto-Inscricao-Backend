import { UpdateValidateInscriptionOutput } from 'src/usecases/web/inscription/update-validate-inscription/update-validate-inscription.usecase';
import { UpdateValidateInscriptionResponse } from './update-validate-inscription.dto';

export class UpdateValidateInscriptionPresenter {
  public static toHttp(
    output: UpdateValidateInscriptionOutput,
  ): UpdateValidateInscriptionResponse {
    return {
      id: output.id,
      expiresAt: output.expiresAt,
    };
  }
}
