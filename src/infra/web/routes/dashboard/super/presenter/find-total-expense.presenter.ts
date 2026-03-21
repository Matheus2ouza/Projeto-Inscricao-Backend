import { FindTotalExpenseOutput } from 'src/usecases/web/dashboard/admin/find-total-expense.usecase';
import { FindTotalExpenseSuperResponse } from '../dto/find-total-expense.dto';

export class FindTotalExpenseSuperPresenter {
  public static tohttp(
    output: FindTotalExpenseOutput,
  ): FindTotalExpenseSuperResponse {
    return {
      totalExpense: output.totalExpense,
    };
  }
}
