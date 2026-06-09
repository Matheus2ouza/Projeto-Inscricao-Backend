import { DeleteReceiptExpenseOutput } from 'src/usecases/web/expenses/delete-receipt-expense/delete-receipt-expense.usecase';
import { DeleteReceiptExpenseResponse } from './delete-receipt-expense.dto';

export class DeleteReceiptExpensePresenter {
  public static toHttp(
    output: DeleteReceiptExpenseOutput,
  ): DeleteReceiptExpenseResponse {
    return {
      deleted: output.deleted,
      remainingReceipts: output.remainingReceipts,
    };
  }
}
