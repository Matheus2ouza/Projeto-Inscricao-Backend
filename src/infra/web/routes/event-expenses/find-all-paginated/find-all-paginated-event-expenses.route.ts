import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindAllPaginatedEventExpensesUsecase } from 'src/usecases/event-expenses/find-all-paginated/find-all-paginated-event-expenses.usecase';
import type {
  FindAllPaginatedEventExpensesRequest,
  FindAllPaginatedEventExpensesResponse,
} from './find-all-paginated-event-expenses.dto';
import { FindAllPaginatedEventExpensesPresenter } from './find-all-paginated-event-expenses.presenter';

@Controller('event-expenses')
export class FindAllPaginatedEventExpensesRoute {
  public constructor(
    private readonly findAllPaginatedEventExpensesUsecase: FindAllPaginatedEventExpensesUsecase,
  ) {}

  @Get(':eventId')
  async handle(
    @Param('eventId') eventId: string,
    @Query() query: FindAllPaginatedEventExpensesRequest,
  ): Promise<FindAllPaginatedEventExpensesResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');

    const result = await this.findAllPaginatedEventExpensesUsecase.execute({
      eventId,
      page,
      pageSize,
    });

    return FindAllPaginatedEventExpensesPresenter.toHttp(result);
  }
}
