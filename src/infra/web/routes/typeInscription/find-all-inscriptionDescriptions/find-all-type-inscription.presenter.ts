import { FindAllTypeInscriptionOutput } from 'src/usecases/web/typeInscription/find-all-inscription/find-all-inscription.usecase';
import { FindAllTypeInscriptionResponse } from './find-all-type-inscription.dto';

export class FindAllTypeInscriptionPresenter {
  public static toHttp(
    input: FindAllTypeInscriptionOutput,
  ): FindAllTypeInscriptionResponse {
    return input.map((typeInscription) => ({
      id: typeInscription.id,
      description: typeInscription.description,
      value: typeInscription.value,
    }));
  }
}
