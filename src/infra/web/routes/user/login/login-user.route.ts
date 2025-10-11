import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  loginUserInput,
  LoginUserUsecase,
} from 'src/usecases/user/login/login-user.usecase';
import type { LoginUserRequest, LoginUserResponse } from './login-user.dto';
import { LoginUserPresenter } from './login-user.presenter';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';

@Controller('users')
export class LoginUserRoute {
  public constructor(private readonly loginUserUsecase: LoginUserUsecase) {}

  @IsPublic()
  @Post('/')
  public async handle(
    @Body() request: LoginUserRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginUserResponse> {
    const input: loginUserInput = {
      username: request.username.trim(),
      password: request.password.trim(),
    };

    const result = await this.loginUserUsecase.execute(input);
    const response = LoginUserPresenter.toHttp(result);

    // Retorne role, authToken e refreshToken no body
    return {
      authToken: response.authToken,
      refreshToken: response.refreshToken,
      user: response.user,
    };
  }
}
