import { FindAllNamesOutput } from 'src/usecases/web/region/findAllRegionNames/find-all-region-names.usecase';
import { FindAllNamesResponse } from './find-all-names.dto';

export class FindAllNamesPresenter {
  public static toHttp(input: FindAllNamesOutput): FindAllNamesResponse {
    return input.map((region) => ({
      id: region.id,
      name: region.name,
    }));
  }
}
