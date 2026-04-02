import { UpdateTypeInscriptionActiveOutput } from 'src/usecases/web/typeInscription/disability-type-inscription/update-type-inscription-active.usecase';
import { UpdateTypeInscriptionActiveResponse } from './update-type-inscription-active.dto';

export class UpdateTypeInscriptionActivePresenter {
  public static toHttp(
    output: UpdateTypeInscriptionActiveOutput,
  ): UpdateTypeInscriptionActiveResponse {
    return {
      id: output.id,
      active: output.active,
    };
  }
}
