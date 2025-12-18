import { Controller, Get, Query } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  FindAllWithExpensesInput,
  FindAllWithExpensesUsecase,
} from 'src/usecases/web/event/find-all-with-expenses/find-all-with-expenses.usecase';
import type { FindAllWithInscriptionsRequest } from '../find-all-with-inscriptions/find-all-with-inscriptions.dto';
import { FindAllWithExpensesResponse } from './find-all-with-expenses.dto';
import { FindAllWithExpensesPresenter } from './find-all-with-expenses.presenter';

@Controller('events')
export class FindAllWithExpensesRoute {
  public constructor(
    private readonly findAllWithExpensesUsecase: FindAllWithExpensesUsecase,
  ) {}

  @Get('expenses')
  async handle(
    @Query() query: FindAllWithInscriptionsRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<FindAllWithExpensesResponse> {
    const status = Array.isArray(query.status)
      ? query.status.map((s) => s as statusEvent)
      : query.status
        ? [query.status as statusEvent]
        : [];

    const input: FindAllWithExpensesInput = {
      regionId: userInfo.userRole === 'SUPER' ? undefined : userInfo.regionId,
      status,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.findAllWithExpensesUsecase.execute(input);
    return FindAllWithExpensesPresenter.toHttp(response);
  }
}
