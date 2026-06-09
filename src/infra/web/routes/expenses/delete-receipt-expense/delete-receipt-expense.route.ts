import { Controller, Delete, Param, Query } from '@nestjs/common';
import {
  DeleteReceiptExpenseInput,
  DeleteReceiptExpenseUsecase,
} from 'src/usecases/web/expenses/delete-receipt-expense/delete-receipt-expense.usecase';
import {
  DeleteReceiptExpenseParams,
  DeleteReceiptExpenseQuery,
  DeleteReceiptExpenseResponse,
} from './delete-receipt-expense.dto';
import { DeleteReceiptExpensePresenter } from './delete-receipt-expense.presenter';

@Controller('expenses')
export class DeleteReceiptExpenseRoute {
  constructor(
    private readonly deleteReceiptExpenseUsecase: DeleteReceiptExpenseUsecase,
  ) {}

  @Delete(':id/receipts')
  async handle(
    @Param() params: DeleteReceiptExpenseParams,
    @Query() query: DeleteReceiptExpenseQuery,
  ): Promise<DeleteReceiptExpenseResponse> {
    const input: DeleteReceiptExpenseInput = {
      id: params.id,
      receiptIndex: query.receiptIndex,
    };

    const response = await this.deleteReceiptExpenseUsecase.execute(input);
    return DeleteReceiptExpensePresenter.toHttp(response);
  }
}
