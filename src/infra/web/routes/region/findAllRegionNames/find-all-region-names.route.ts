import { Controller, Get } from '@nestjs/common';
import { FindAllRegionNamesUsecase } from 'src/usecases/region/findAllRegionNames/find-all-region-names.usecase';
import { FindAllRegionNamesResponse } from './find-all-region-names.dto';
import { FindAllRegionsNamesPresenter } from './find-all-region-names.presenter';

@Controller('regions')
export class FindAllRegionsRoute {
  public constructor(
    private readonly findAllRegionsUsecase: FindAllRegionNamesUsecase,
  ) {}

  @Get('all/names')
  async handle(): Promise<FindAllRegionNamesResponse> {
    const result = await this.findAllRegionsUsecase.execute();
    const response = FindAllRegionsNamesPresenter.toHttp(result);
    return response;
  }
}
