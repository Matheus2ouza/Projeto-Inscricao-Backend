import { CreateEventExpensesOutput } from 'src/usecases/web/event-expenses/create/create-event-expenses.usecase';
import { CreateEventExpensesResponse } from './create-event-expenses.dto';

export class CreateEventExpensesPresenter {
  public static toHttp(
    output: CreateEventExpensesOutput,
  ): CreateEventExpensesResponse {
    return {
      id: output.id,
    };
  }
}
