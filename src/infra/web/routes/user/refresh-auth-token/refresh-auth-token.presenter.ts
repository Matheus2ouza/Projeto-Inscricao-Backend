import { RefreshAuthTokenLocalityUsecaseOutput } from 'src/usecases/user/refresh-auth-token/refresh-auth-token-user.usecase';
import { RefreshAuthTokenResponse } from './refresh-auth-token.dto';

export class RefreshAuthTokenPresenter {
  public static toHttp(
    input: RefreshAuthTokenLocalityUsecaseOutput,
  ): RefreshAuthTokenResponse {
    const response: RefreshAuthTokenResponse = {
      authToken: input.authToken,
    };

    return response;
  }
}
