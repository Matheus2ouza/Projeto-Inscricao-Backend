import { Body, Controller, Post } from '@nestjs/common';
import {
  ConfirmIndivInput,
  IndivConfirmUsecase,
} from 'src/usecases/inscription/indiv/confirm-indiv.usecase';
import type {
  ConfirmIndivRouteResponse,
  IndivConfirmRequest,
} from './indiv-confirm.dto';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
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
    const input: ConfirmIndivInput = {
      cacheKey: request.cacheKey,
      accountId,
    };

    const response = await this.indivConfirmUsecase.execute(input);
    const result = IndivConfirmPresenter.toHttp(response);
    return result;
  }
}
