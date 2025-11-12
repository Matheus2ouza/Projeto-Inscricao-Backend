import { Controller, Get, Query } from '@nestjs/common';
import { FindAllPaginatedEventToPaymentUsecase } from 'src/usecases/web/event/find-all-to-analysis/payments/find-all-paginated-events-to-payment.usecase';
import type {
  FindAllPaginatedEventToPaymentRequest,
  FindAllPaginatedEventToPaymentResponse,
} from './find-all-paginated-events-to-payments.dto';
import { FindAllPaginatedEventToPaymentPresenter } from './find-all-paginated-events-to-payments.presenter';

@Controller('events')
export class FindAllPaginatedEventToPaymentRoute {
  public constructor(
    private readonly findAllPaginatedEventToPaymentUsecase: FindAllPaginatedEventToPaymentUsecase,
  ) {}

  @Get('analysis/payment')
  async handle(
    @Query() query: FindAllPaginatedEventToPaymentRequest,
  ): Promise<FindAllPaginatedEventToPaymentResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const result = await this.findAllPaginatedEventToPaymentUsecase.execute({
      page,
      pageSize,
    });

    return FindAllPaginatedEventToPaymentPresenter.toHttp(result);
  }
}
