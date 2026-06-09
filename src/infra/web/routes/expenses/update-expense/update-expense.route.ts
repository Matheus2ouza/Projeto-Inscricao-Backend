import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  UpdateExpenseInput,
  UpdateExpenseUsecase,
} from 'src/usecases/web/expenses/update-expense/update-expense.usecase';
import {
  UpdateExpenseBody,
  UpdateExpenseParams,
  UpdateExpenseResponse,
} from './update-expense.dto';
import { UpdateExpensePresenter } from './update-expense.presenter';

@Controller('expenses')
export class UpdateExpenseRoute {
  constructor(private readonly updateExpenseUsecase: UpdateExpenseUsecase) {}

  @Patch(':id')
  async handle(
    @Param() param: UpdateExpenseParams,
    @Body() body: UpdateExpenseBody,
  ): Promise<UpdateExpenseResponse> {
    const input: UpdateExpenseInput = {
      id: param.id,
      description: body.description,
      value: body.value,
      paymentMethod: body.paymentMethod,
      responsible: body.responsible,
      category: body.category,
      createdAt: body.createdAt,
    };

    const response = await this.updateExpenseUsecase.execute(input);
    return UpdateExpensePresenter.toHttp(response);
  }
}
