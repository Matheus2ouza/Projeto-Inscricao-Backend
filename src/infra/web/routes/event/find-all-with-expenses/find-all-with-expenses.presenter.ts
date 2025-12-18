import { FindAllWithExpensesOutPut } from 'src/usecases/web/event/find-all-with-expenses/find-all-with-expenses.usecase';
import { FindAllWithExpensesResponse } from './find-all-with-expenses.dto';

export class FindAllWithExpensesPresenter {
  public static toHttp(
    output: FindAllWithExpensesOutPut,
  ): FindAllWithExpensesResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
