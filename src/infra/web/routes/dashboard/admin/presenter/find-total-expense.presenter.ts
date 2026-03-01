import { FindTotalExpenseOutput } from 'src/usecases/web/dashboard/admin/find-total-expense.usecase';
import { FindTotalExpenseAdminResponse } from '../dto/find-total-expense.dto';

export class FindTotalExpenseAdminPresenter {
  public static tohttp(
    output: FindTotalExpenseOutput,
  ): FindTotalExpenseAdminResponse {
    return {
      totalExpense: output.totalExpense,
    };
  }
}
