import { FindAllRegionsOutput } from 'src/usecases/web/region/findAllRegionNames/find-all-region-names.usecase';
import { FindAllRegionNamesResponse } from './find-all-region-names.dto';

export class FindAllRegionsNamesPresenter {
  public static toHttp(
    input: FindAllRegionsOutput,
  ): FindAllRegionNamesResponse {
    return input.map((region) => ({
      id: region.id,
      name: region.name,
    }));
  }
}
