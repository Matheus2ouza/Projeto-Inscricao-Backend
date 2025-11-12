import { Body, Controller, Post } from '@nestjs/common';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';
import {
  CreateRegionInput,
  CreateRegionOutput,
  CreateRegionUseCase,
} from 'src/usecases/web/region/create/create-region.usecase';
import type {
  CreateRegionRequest,
  CreateRegionResponse,
} from './create-region.dto';
import { CreateRegionPresenter } from './create-region.presenter';

@Controller('regions')
export class CreateRegionRoute {
  public constructor(
    private readonly createRegionUseCase: CreateRegionUseCase,
  ) {}

  @Roles(RoleTypeHierarchy.SUPER)
  @Post('create')
  async handle(
    @Body() request: CreateRegionRequest,
  ): Promise<CreateRegionResponse> {
    const input: CreateRegionInput = {
      name: request.name,
    };
    const region: CreateRegionOutput =
      await this.createRegionUseCase.execute(input);
    const response = CreateRegionPresenter.toHttp(region);
    return response;
  }
}
