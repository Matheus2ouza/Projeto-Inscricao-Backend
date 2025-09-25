import { Body, Controller, Post } from '@nestjs/common';
import {
  RefreshAuthTokenUserUsecase,
  RefreshAuthTokenUserUsecaseInput,
} from 'src/usecases/user/refresh-auth-token/refresh-auth-token-user.usecase';
import {
  RefreshAuthTokenRequest,
  RefreshAuthTokenResponse,
} from './refresh-auth-token.dto';
import { RefreshAuthTokenPresenter } from './refresh-auth-token.presenter';

@Controller('users')
export class RefreshAuthTokenRoute {
  public constructor(
    private readonly refreshAuthTokenUsecase: RefreshAuthTokenUserUsecase,
  ) {}

  @Post('refresh')
  public async handle(
    @Body() request: RefreshAuthTokenRequest,
  ): Promise<RefreshAuthTokenResponse> {
    const input: RefreshAuthTokenUserUsecaseInput = {
      refreshToken: request.refreshToken,
    };

    const result = await this.refreshAuthTokenUsecase.execute(input);

    const response = RefreshAuthTokenPresenter.toHttp(result);

    return response;
  }
}
