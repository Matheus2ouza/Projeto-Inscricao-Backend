import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserUsecase } from 'src/usecases/user/create/create-user.usecase';
import type { CreateUserInput } from 'src/usecases/user/create/create-user.usecase';
import type {
  CreateUserRequest,
  CreateUserRouteResponse,
} from './create-user.dto';
import { CreateUserPresenter } from './create-user.presenter';

@Controller('users')
export class CreateUserRoute {
  public constructor(private readonly createUserUseCase: CreateUserUsecase) {}

  @Post('create')
  public async handle(
    @Body() request: CreateUserRequest,
  ): Promise<CreateUserRouteResponse> {
    const input: CreateUserInput = {
      username: request.username,
      password: request.password,
    };

    const result = await this.createUserUseCase.execute(input);

    const response = CreateUserPresenter.toHttp(result);
    return response;
  }
}
