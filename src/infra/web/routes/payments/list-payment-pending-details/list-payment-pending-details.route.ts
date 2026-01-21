import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ListPaymentPendingDetailsInput,
  ListPaymentPendingDetailsUsecase,
} from 'src/usecases/web/payments/list-payment-pending-details/list-payment-pending-details.usecase';
import type {
  ListPaymentPendingDetailsRequest,
  ListPaymentPendingDetailsResponse,
} from './list-payment-pending-details.dto';
import { ListPaymentDetailsPresenter } from './list-payment-pending-details.presenter';

@Controller('payments')
export class ListPaymentPendingDetailsRoute {
  constructor(
    private readonly listPaymentPendingDetailsUsecase: ListPaymentPendingDetailsUsecase,
  ) {}

  @Get(':inscriptionId/list/pending/details')
  async handle(
    @Param() param: ListPaymentPendingDetailsRequest,
    @Query() query: ListPaymentPendingDetailsRequest,
  ): Promise<ListPaymentPendingDetailsResponse> {
    const input: ListPaymentPendingDetailsInput = {
      inscriptionId: param.inscriptionId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listPaymentPendingDetailsUsecase.execute(input);
    return ListPaymentDetailsPresenter.toResponse(response);
  }
}
