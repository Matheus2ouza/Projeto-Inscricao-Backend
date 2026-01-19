import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  ListAllPaymentsPendingInput,
  ListAllPaymentsPendingUsecase,
} from 'src/usecases/web/payments/list-all-payments-pending/list-all-payments-pending.usecase';
import type {
  ListAllPaymentsPendingRequest,
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
    @Param() param: ListAllPaymentsPendingRequest,
    @Query() query: ListAllPaymentsPendingRequest,
    @UserId() accountId: string,
  ): Promise<ListAllPaymentsPendingResponse> {
    const input: ListAllPaymentsPendingInput = {
      eventId: param.eventId,
      accountId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listAllPaymentsPendingUsecase.execute(input);
    return ListAllPaymentsPendingPresenter.toHttp(response);
  }
}
