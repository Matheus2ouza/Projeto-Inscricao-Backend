import { Controller, Get } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import { FindAllRegionNamesUsecase } from 'src/usecases/region/findAllRegionNames/find-all-region-names.usecase';
import { FindAllRegionNamesResponse } from './find-all-region-names.dto';
import { FindAllRegionsNamesPresenter } from './find-all-region-names.presenter';

@Controller('regions')
export class FindAllRegionsRoute {
  public constructor(
    private readonly findAllRegionsUsecase: FindAllRegionNamesUsecase,
  ) {}

  @Roles(RoleTypeHierarchy.SUPER)
  @Get('all/names')
  async handle(): Promise<FindAllRegionNamesResponse> {
    const result = await this.findAllRegionsUsecase.execute();
    const response = FindAllRegionsNamesPresenter.toHttp(result);
    return response;
  }
}
