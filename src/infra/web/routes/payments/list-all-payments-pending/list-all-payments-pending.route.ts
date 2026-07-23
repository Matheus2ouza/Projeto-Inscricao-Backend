import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  UserInfo,
  UserInfoType,
} from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  ListAllPaymentsPendingInput,
  ListAllPaymentsPendingUsecase,
} from 'src/usecases/web/payments/list-all-payments-pending/list-all-payments-pending.usecase';
import type {
  ListAllPaymentsPendingParam,
  ListAllPaymentsPendingQuery,
  ListAllPaymentsPendingResponse,
} from './list-all-payments-pending.dto';
import { ListAllPaymentsPendingPresenter } from './list-all-payments-pending.presenter';

@Controller('payments')
export class ListAllPaymentsPendingRoute {
  constructor(
    private readonly listAllPaymentsPendingUsecase: ListAllPaymentsPendingUsecase,
  ) {}

  @Get(':eventId/list/pending')
  async handle(
    @Param() param: ListAllPaymentsPendingParam,
    @Query() query: ListAllPaymentsPendingQuery,
    @UserInfo() user: UserInfoType,
  ): Promise<ListAllPaymentsPendingResponse> {
    const input: ListAllPaymentsPendingInput = {
      eventId: param.eventId,
      localityId: query.localityId,
      accountId: user.userId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listAllPaymentsPendingUsecase.execute(input);
    return ListAllPaymentsPendingPresenter.toHttp(response);
  }
}
