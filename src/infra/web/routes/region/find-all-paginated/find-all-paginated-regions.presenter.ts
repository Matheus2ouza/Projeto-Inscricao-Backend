import { FindAllPaginatedRegionsOutput } from 'src/usecases/region/findAllRegion/find-all-paginated-regions.usecase';
import { FindAllPaginatedRegionResponse } from './find-all-paginated-regions.dto';

export class FindAllPaginatedRegionsPresenter {
  public static toHttp(
    input: FindAllPaginatedRegionsOutput,
  ): FindAllPaginatedRegionResponse {
    return {
      regions: input.regions,
      total: input.total,
      page: input.page,
      pageCount: input.pageCount,
    };
  }
}
