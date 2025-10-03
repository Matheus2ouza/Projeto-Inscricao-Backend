import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  CreateRegionInput,
  CreateRegionOutput,
  CreateRegionUseCase,
} from 'src/usecases/region/create/create-region.usecase';
import { CreateRegionPresenter } from './create-region.presenter';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import type {
  CreateRegionRequest,
  CreateRegionResponse,
} from './create-region.dto';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';

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
