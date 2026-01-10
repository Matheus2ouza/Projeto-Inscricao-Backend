import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  ListAllPaymentsInput,
  ListAllPaymentsUsecase,
} from 'src/usecases/web/payments/list-all-payments/list-all-payments.usecase';
import type {
  ListAllPaymentsRequest,
  ListAllPaymentsResponse,
} from './list-all-payments.dto';
import { ListAllPaymentsPresenter } from './list-all-payments.presenter';

@Controller('payments')
export class ListAllPaymentsRoute {
  constructor(
    private readonly listAllPaymentsUsecase: ListAllPaymentsUsecase,
  ) {}

  @Get(':eventId/list')
  async handle(
    @Param() param: ListAllPaymentsRequest,
    @Query() query: ListAllPaymentsRequest,
    @UserId() accountId: string,
  ): Promise<ListAllPaymentsResponse> {
    const input: ListAllPaymentsInput = {
      eventId: param.eventId,
      accountId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listAllPaymentsUsecase.execute(input);
    return ListAllPaymentsPresenter.toHttp(response);
  }
}
