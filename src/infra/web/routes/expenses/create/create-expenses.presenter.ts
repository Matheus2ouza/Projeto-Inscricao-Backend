import { CreateExpensesOutput } from 'src/usecases/web/event-expenses/create/create-event-expenses.usecase';
import { CreateExpensesResponse } from './create-expenses.dto';

export class CreateExpensesPresenter {
  public static toHttp(output: CreateExpensesOutput): CreateExpensesResponse {
    return {
      id: output.id,
    };
  }
}
