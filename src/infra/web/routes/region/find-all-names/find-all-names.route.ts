import { Controller, Get } from '@nestjs/common';
import { FindAllNamesUsecase } from 'src/usecases/web/region/findAllRegionNames/find-all-region-names.usecase';
import { FindAllNamesResponse } from './find-all-names.dto';
import { FindAllNamesPresenter } from './find-all-names.presenter';

@Controller('regions')
export class FindAllNamesRoute {
  public constructor(
    private readonly findAllRegionsUsecase: FindAllNamesUsecase,
  ) {}

  @Get('all/names')
  async handle(): Promise<FindAllNamesResponse> {
    const result = await this.findAllRegionsUsecase.execute();
    const response = FindAllNamesPresenter.toHttp(result);
    return response;
  }
}
