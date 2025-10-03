import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { CreateUserUsecase } from 'src/usecases/user/create/create-user.usecase';
import type { CreateUserInput } from 'src/usecases/user/create/create-user.usecase';
import type {
  CreateUserRequest,
  CreateUserRouteResponse,
} from './create-user.dto';
import { CreateUserPresenter } from './create-user.presenter';
import { Roles } from 'src/infra/web/authenticator/decorators/roles.decorator';
import { RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';

@Controller('users')
export class CreateUserRoute {
  public constructor(private readonly createUserUseCase: CreateUserUsecase) {}

  @Roles(RoleTypeHierarchy.MANAGER)
  @Post('create')
  public async handle(
    @Body() request: CreateUserRequest,
    @Req() req,
  ): Promise<CreateUserRouteResponse> {
    const input: CreateUserInput = {
      username: request.username,
      password: request.password,
      role: request.role,
      requesterRole: req['userRole'],
    };

    const result = await this.createUserUseCase.execute(input);

    const response = CreateUserPresenter.toHttp(result);
    return response;
  }
}
