import { Body, Controller, Post, Req } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
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

  @IsPublic()
  @Post('create')
  public async handle(
    @Body() request: CreateUserRequest,
    @Req() req,
  ): Promise<CreateUserRouteResponse> {
    const input: CreateUserInput = {
      username: request.username,
      password: request.password,
      role: request.role,
      regionId: request.regionId,
      requesterRole: req['userRole'],
      email: request.email,
    };

    const result = await this.createUserUseCase.execute(input);

    const response = CreateUserPresenter.toHttp(result);
    return response;
  }
}
