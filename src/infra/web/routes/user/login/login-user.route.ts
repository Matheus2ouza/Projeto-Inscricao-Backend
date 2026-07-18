import { Body, Controller, Post } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  loginUserInput,
  LoginUserUsecase,
} from 'src/usecases/web/user/login/login-user.usecase';
import type { LoginUserRequest, LoginUserResponse } from './login-user.dto';
import { LoginUserPresenter } from './login-user.presenter';

@Controller('users')
export class LoginUserRoute {
  public constructor(private readonly loginUserUsecase: LoginUserUsecase) {}

  @IsPublic()
  @Post('/login')
  public async handle(
    @Body() request: LoginUserRequest,
  ): Promise<LoginUserResponse> {
    const input: loginUserInput = {
      username: request.username,
      password: request.password,
    };

    const response = await this.loginUserUsecase.execute(input);
    return LoginUserPresenter.toHttp(response);
  }
}
