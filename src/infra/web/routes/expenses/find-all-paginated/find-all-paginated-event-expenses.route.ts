import { Controller, Get, Param, Query } from '@nestjs/common';
import { FindAllPaginatedEventExpensesUsecase } from 'src/usecases/web/expenses/find-all-paginated/find-all-paginated-event-expenses.usecase';
import type {
  FindAllPaginatedEventExpensesParams,
  FindAllPaginatedEventExpensesQuery,
  FindAllPaginatedEventExpensesResponse,
} from './find-all-paginated-event-expenses.dto';
import { FindAllPaginatedEventExpensesPresenter } from './find-all-paginated-event-expenses.presenter';

@Controller('expenses')
export class FindAllPaginatedEventExpensesRoute {
  public constructor(
    private readonly findAllPaginatedEventExpensesUsecase: FindAllPaginatedEventExpensesUsecase,
  ) {}

  @Get('/list/:eventId')
  async handle(
    @Param() parms: FindAllPaginatedEventExpensesParams,
    @Query() query: FindAllPaginatedEventExpensesQuery,
  ): Promise<FindAllPaginatedEventExpensesResponse> {
    const result = await this.findAllPaginatedEventExpensesUsecase.execute({
      eventId: parms.eventId,
      page: query.page,
      pageSize: query.pageSize,
    });

    return FindAllPaginatedEventExpensesPresenter.toHttp(result);
  }
}
