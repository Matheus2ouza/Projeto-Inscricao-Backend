import { CreateExpensesOutput } from 'src/usecases/web/expenses/create-expenses/create-expenses.usecase';
import { CreateExpensesResponse } from './create-expenses.dto';

export class CreateExpensesPresenter {
  public static toHttp(output: CreateExpensesOutput): CreateExpensesResponse {
    return {
      id: output.id,
    };
  }
}
