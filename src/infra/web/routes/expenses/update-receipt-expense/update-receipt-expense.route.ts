import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  UpdateReceiptExpenseInput,
  UpdateReceiptExpenseUsecase,
} from 'src/usecases/web/expenses/update-receipt-expense/update-receipt-expense.usecase';
import {
  UpdateReceiptExpenseBody,
  UpdateReceiptExpenseParams,
  UpdateReceiptExpenseResponse,
} from './update-receipt-expense.dto';
import { UpdateReceiptExpensePresenter } from './update-receipt-expense.presenter';

@Controller('expenses')
export class UpdateReceiptExpenseRoute {
  constructor(
    private readonly updateReceiptExpenseUsecase: UpdateReceiptExpenseUsecase,
  ) {}

  @Post(':id/receipts')
  async handle(
    @Param() param: UpdateReceiptExpenseParams,
    @Body() body: UpdateReceiptExpenseBody,
  ): Promise<UpdateReceiptExpenseResponse> {
    const input: UpdateReceiptExpenseInput = {
      id: param.id,
      receipts: body.receipts,
    };

    const response = await this.updateReceiptExpenseUsecase.execute(input);
    return UpdateReceiptExpensePresenter.toHttp(response);
  }
}
