import { UpdateReceiptExpenseOutput } from 'src/usecases/web/expenses/update-receipt-expense/update-receipt-expense.usecase';
import { UpdateReceiptExpenseResponse } from './update-receipt-expense.dto';

export class UpdateReceiptExpensePresenter {
  public static toHttp(
    output: UpdateReceiptExpenseOutput,
  ): UpdateReceiptExpenseResponse {
    return {
      receipts: output.receipts,
    };
  }
}
