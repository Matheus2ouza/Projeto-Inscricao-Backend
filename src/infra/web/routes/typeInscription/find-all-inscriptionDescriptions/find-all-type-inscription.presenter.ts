import { FindAllInscriptionOutput } from 'src/usecases/web/typeInscription/find-all-inscription/find-all-inscription.usecase';
import { FindAllInscriptionResponse } from './find-all-type-inscription.dto';

export class FindAllInscriptionPresenter {
  public static toHttp(
    input: FindAllInscriptionOutput,
  ): FindAllInscriptionResponse {
    return input.map((typeInscription) => ({
      id: typeInscription.id,
      description: typeInscription.description,
      value: typeInscription.value,
    }));
  }
}
