import { FindTotalExpenseOutput } from 'src/usecases/web/dashboard/admin/find-total-expense.usecase';
import { FindTotalExpenseResponse } from '../dto/find-total-expense.dto';

export class FindTotalExpenseAdminPresenter {
  public static tohttp(
    output: FindTotalExpenseOutput,
  ): FindTotalExpenseResponse {
    return {
      totalExpense: output.totalExpense,
    };
  }
}
