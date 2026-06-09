import { UpdateExpenseOutput } from 'src/usecases/web/expenses/update-expense/update-expense.usecase';
import { UpdateExpenseResponse } from './update-expense.dto';

export class UpdateExpensePresenter {
  public static toHttp(output: UpdateExpenseOutput): UpdateExpenseResponse {
    return {
      id: output.id,
      updated: output.updated,
    };
  }
}
