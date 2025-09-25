import { Body, Controller, Post } from '@nestjs/common';
import {
  loginUserInput,
  LoginUserUsecase,
} from 'src/usecases/user/login/login-user.usecase';
import { LoginUserRequest, LoginUserResponse } from './login-user.dto';
import { LoginUserPresenter } from './login-user.presenter';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';

@Controller('user')
export class LoginUserRoute {
  public constructor(private readonly loginUserUsecase: LoginUserUsecase) {}

  @IsPublic()
  @Post('login')
  public async handle(
    @Body() request: LoginUserRequest,
  ): Promise<LoginUserResponse> {
    const input: loginUserInput = {
      username: request.username,
      password: request.password,
    };

    const result = await this.loginUserUsecase.execute(input);

    const response = LoginUserPresenter.toHttp(result);

    return response;
  }
}
