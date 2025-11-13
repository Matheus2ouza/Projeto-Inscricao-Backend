import { loginUserOutput } from 'src/usecases/web/user/login/login-user.usecase';
import { LoginUserResponse } from './login-user.dto';

export class LoginUserPresenter {
  public static toHttp(input: loginUserOutput): LoginUserResponse {
    const response: LoginUserResponse = {
      authToken: input.authToken,
      refreshToken: input.refreshToken,
      user: input.user,
    };

    return response;
  }
}
