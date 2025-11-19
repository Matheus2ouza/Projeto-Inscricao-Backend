import { UpdateTypeInscriptionOutput } from 'src/usecases/web/typeInscription/update/update-type-inscription.usecase';
import { UpdateTypeInscriptionResponse } from './update-type-inscription.dto';

export class UpdateTypeInscriptionPresenter {
  public static toHttp(
    output: UpdateTypeInscriptionOutput,
  ): UpdateTypeInscriptionResponse {
    return {
      id: output.id,
    };
  }
}
