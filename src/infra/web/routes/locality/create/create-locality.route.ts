import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateLocalityInput,
  CreateLocalityUsecase,
} from 'src/usecases/locality/create/create-locality.usecase';
import {
  CreateLocalityRequest,
  CreateLocalityRouteResponse,
} from './create-locality.dto';
import { CreateLocalityPresenter } from './create-locality.presenter';

@Controller("localities")
export class CreateLocalityRoute {
  public constructor(
    private readonly createLocalityUseCase: CreateLocalityUsecase,
  ) {}

  @Post()
  public async handle(
    @Body() request: CreateLocalityRequest,
  ): Promise<CreateLocalityRouteResponse> {
    const input: CreateLocalityInput = {
      locality: request.locality,
      password: request.password,
    };

    const result = await this.createLocalityUseCase.execute(input);

    const response = CreateLocalityPresenter.toHttp(result);
    return response;
  }
}
