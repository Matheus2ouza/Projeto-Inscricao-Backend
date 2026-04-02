import { FindAllNamesInscriptionOutput } from 'src/usecases/web/inscription/find-all-names/find-all-names-inscription.usecase';
import { FindAllNamesInscriptionResponse } from './find-all-names-inscription.dto';

export class FindAllNamesInscriptionPresenter {
  public static toHttp(
    output: FindAllNamesInscriptionOutput,
  ): FindAllNamesInscriptionResponse {
    return output.map((item) => ({
      id: item.id,
      name: item.name,
    }));
  }
}
