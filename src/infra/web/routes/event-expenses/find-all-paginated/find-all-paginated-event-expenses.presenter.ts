import { FindAllPaginatedEventExpensesOutput } from 'src/usecases/event-expenses/find-all-paginated/find-all-paginated-event-expenses.usecase';
import { FindAllPaginatedEventExpensesResponse } from './find-all-paginated-event-expenses.dto';

export class FindAllPaginatedEventExpensesPresenter {
  public static toHttp(
    output: FindAllPaginatedEventExpensesOutput,
  ): FindAllPaginatedEventExpensesResponse {
    return {
      expenses: output.expenses,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
