import { FindAllNamesOutput } from 'src/usecases/web/region/findAllRegionNames/find-all-region-names.usecase';
import { FindAllNamesInscriptionResponse } from './find-all-names-inscription.dto';

export class FindAllNamesInscriptionPresenter {
  public static toHttp(
    output: FindAllNamesOutput,
  ): FindAllNamesInscriptionResponse {
    return output.map((item) => ({
      id: item.id,
      name: item.name,
    }));
  }
}
