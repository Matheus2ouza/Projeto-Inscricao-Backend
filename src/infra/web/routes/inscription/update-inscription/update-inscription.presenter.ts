import { UpdateInscriptionOutput } from 'src/usecases/web/inscription/update-inscription/update-inscription.usecase';
import { UpdateInscriptionResponse } from './update-inscription.dto';

export class UpdateInscriptionPresenter {
  public static toHttp(
    output: UpdateInscriptionOutput,
  ): UpdateInscriptionResponse {
    return {
      id: output.id,
    };
  }
}
