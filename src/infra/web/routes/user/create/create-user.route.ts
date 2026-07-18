import { Body, Controller, Post } from '@nestjs/common';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import type { CreateUserInput } from 'src/usecases/web/user/create/create-user.usecase';
import { CreateUserUsecase } from 'src/usecases/web/user/create/create-user.usecase';
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
    @UserInfo() user: UserInfoType,
  ): Promise<CreateUserRouteResponse> {
    const input: CreateUserInput = {
      username: request.username,
      password: request.password,
      role: request.role,
      localityId: request.localityId,
      regionId: request.regionId,
      requesterRole: user.userRole,
      email: request.email,
    };

    const result = await this.createUserUseCase.execute(input);

    const response = CreateUserPresenter.toHttp(result);
    return response;
  }
}
