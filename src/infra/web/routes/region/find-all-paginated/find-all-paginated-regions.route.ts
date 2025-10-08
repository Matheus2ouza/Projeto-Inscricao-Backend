import { Controller, Get, Query } from '@nestjs/common';
import { FindAllPaginatedRegionsUsecase } from 'src/usecases/region/findAllRegion/find-all-paginated-regions.usecase';
import { FindAllPaginatedRegionsPresenter } from './find-all-paginated-regions.presenter';
import type {
  FindAllPaginatedRegionRequest,
  FindAllPaginatedRegionResponse,
} from './find-all-paginated-regions.dto';

@Controller('regions')
export class FindAllPaginatedRegionsRoute {
  public constructor(
    private readonly findAllPaginatedRegionsUsecase: FindAllPaginatedRegionsUsecase,
  ) {}

  @Get()
  public async handle(
    @Query() query: FindAllPaginatedRegionRequest,
  ): Promise<FindAllPaginatedRegionResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const result = await this.findAllPaginatedRegionsUsecase.execute({
      page,
      pageSize,
    });

    return FindAllPaginatedRegionsPresenter.toHttp(result);
  }
}
