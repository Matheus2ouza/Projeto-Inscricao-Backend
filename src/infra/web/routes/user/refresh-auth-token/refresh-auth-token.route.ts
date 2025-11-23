import { Body, Controller, Post, Req } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  RefreshAuthTokenUserUsecase,
  RefreshAuthTokenUserUsecaseInput,
} from 'src/usecases/web/user/refresh-auth-token/refresh-auth-token-user.usecase';
import type {
  RefreshAuthTokenRequest,
  RefreshAuthTokenResponse,
} from './refresh-auth-token.dto';
import { RefreshAuthTokenPresenter } from './refresh-auth-token.presenter';

@Controller('users')
export class RefreshAuthTokenRoute {
  public constructor(
    private readonly refreshAuthTokenUsecase: RefreshAuthTokenUserUsecase,
  ) {}

  @IsPublic()
  @Post('refresh')
  public async handle(
    @Body() request: RefreshAuthTokenRequest,
    @Req() req: any,
  ): Promise<RefreshAuthTokenResponse> {
    const refreshToken = request.refreshToken || req.cookies?.refreshToken;
    const input: RefreshAuthTokenUserUsecaseInput = {
      refreshToken,
    };

    const result = await this.refreshAuthTokenUsecase.execute(input);

    const response = RefreshAuthTokenPresenter.toHttp(result);

    return response;
  }
}
