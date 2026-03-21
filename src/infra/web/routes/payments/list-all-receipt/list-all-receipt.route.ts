import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ListAllReceiptInput,
  ListAllReceiptUsecase,
} from 'src/usecases/web/payments/list-all-receipt/list-all-receipt.usecase';
import {
  ListAllReceiptRequest,
  ListAllReceiptResponse,
} from './list-all-receipt.dto';
import { ListAllReceiptPresenter } from './list-all-receipt.presenter';

@Controller('payments')
export class ListAllReceiptRoute {
  constructor(private readonly listAllReceiptUsecase: ListAllReceiptUsecase) {}

  @Get(':eventId/receipts')
  async handle(
    @Param() param: ListAllReceiptRequest,
    @Query() query: ListAllReceiptRequest,
  ): Promise<ListAllReceiptResponse> {
    const input: ListAllReceiptInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.listAllReceiptUsecase.execute(input);
    return ListAllReceiptPresenter.toHttp(response);
  }
}
