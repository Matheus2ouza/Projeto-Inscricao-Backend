import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  IndivConfirmInput,
  IndivConfirmUsecase,
} from 'src/usecases/web/inscription/indiv/confirm/indiv-confirm.usecase';
import type {
  ConfirmIndivRouteResponse,
  IndivConfirmRequest,
} from './indiv-confirm.dto';
import { IndivConfirmPresenter } from './indiv-confirm.presenter';

@Controller('inscriptions/indiv')
export class IndivConfirmRoute {
  public constructor(
    private readonly indivConfirmUsecase: IndivConfirmUsecase,
  ) {}

  @Post('confirm')
  public async handle(
    @Body() request: IndivConfirmRequest,
    @UserId() accountId: string,
  ): Promise<ConfirmIndivRouteResponse> {
    const input: IndivConfirmInput = {
      cacheKey: request.cacheKey,
      accountId,
    };

    const response = await this.indivConfirmUsecase.execute(input);
    const result = IndivConfirmPresenter.toHttp(response);
    return result;
  }
}
