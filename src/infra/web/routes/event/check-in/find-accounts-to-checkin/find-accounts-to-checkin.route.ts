import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  FindAccountsToCheckInInput,
  FindAccountsToCheckInUsecase,
} from 'src/usecases/web/event/check-in/find-accounts-to-checkin/find-accounts-to-checkin.usecase';
import type {
  AccountsPaginatedResponse,
  EventCheckInInfoResponse,
  FindAccountsToCheckInRequest,
} from './find-accounts-to-checkin.dto';
import { FindAccountsToCheckInPresenter } from './find-accounts-to-checkin.presenter';

@Controller('events')
export class FindAccountsToCheckInRoute {
  constructor(
    private readonly findAccountsToCheckInUsecase: FindAccountsToCheckInUsecase,
  ) {}

  // Rota para dados fixos do evento (SEM contas)
  @Get(':eventId/check-in')
  async getEventInfo(
    @Param('eventId') eventId: string,
  ): Promise<EventCheckInInfoResponse> {
    const input: FindAccountsToCheckInInput = {
      eventId,
      page: 1,
      pageSize: 1,
    };

    const result = await this.findAccountsToCheckInUsecase.execute(input);

    return FindAccountsToCheckInPresenter.toEventInfo(result);
  }

  // Rota para contas paginadas
  @Get(':eventId/check-in/accounts')
  async getAccounts(
    @Param('eventId') eventId: string,
    @Query() query: FindAccountsToCheckInRequest,
  ): Promise<AccountsPaginatedResponse> {
    const input: FindAccountsToCheckInInput = {
      eventId,
      accountId: query.accountId,
      withDebt: query.withDebt,
      page: Number(query.page ?? 1),
      pageSize: Number(query.pageSize ?? 10),
    };

    console.log(input);
    const result = await this.findAccountsToCheckInUsecase.execute(input);

    return FindAccountsToCheckInPresenter.toAccountsPaginated(result);
  }
}
