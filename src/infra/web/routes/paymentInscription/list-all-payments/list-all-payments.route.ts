import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ListAllPaymentsInput,
  ListAllPaymentsUsecase,
} from 'src/usecases/web/paymentInscription/list-all-payments/list-all-payments.usecase';
import type {
  ListAllPaymentsRequest,
  ListAllPaymentsResponse,
} from './list-all-payments.dto';
import { ListAllPaymentsPresenter } from './list-all-payments.presenter';

@Controller('payments')
export class ListAllPaymentsRoute {
  constructor(
    private readonly ListAllPaymentsUsecase: ListAllPaymentsUsecase,
  ) {}

  @Get(':eventId/list')
  async handle(
    @Param() param: ListAllPaymentsRequest,
    @Query() query: ListAllPaymentsRequest,
  ): Promise<ListAllPaymentsResponse> {
    const input: ListAllPaymentsInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,
    };
    const response = await this.ListAllPaymentsUsecase.execute(input);
    return ListAllPaymentsPresenter.toHttp(response);
  }
}
