import { Controller, Get, Param } from '@nestjs/common';
import {
  FindAccountsDetailsInput,
  FindAccountsDetailsUseCase,
} from 'src/usecases/web/event/check-in/find-accounts-details/find-accounts-details.usecase';
import type {
  FindAccountsDetailsRequest,
  FindAccountsDetailsResponse,
} from './find-accounts-details.dto';
import { FindAccountsDetailsPresenter } from './find-accounts-details.presenter';

@Controller('events')
export class FindAccountsDetailsRoute {
  constructor(
    private readonly findAccountsDetailsUseCase: FindAccountsDetailsUseCase,
  ) {}

  @Get(':eventId/check-in/accounts/:accountId/details')
  async handle(
    @Param() params: FindAccountsDetailsRequest,
  ): Promise<FindAccountsDetailsResponse> {
    const input: FindAccountsDetailsInput = {
      eventId: params.eventId,
      accountId: params.accountId,
    };
    const response = await this.findAccountsDetailsUseCase.execute(input);
    return FindAccountsDetailsPresenter.toHttp(response);
  }
}
