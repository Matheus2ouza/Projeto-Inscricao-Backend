import { Controller, Get, Param } from '@nestjs/common';
import {
  FindDetailsExpenseInput,
  FindDetailsExpenseUsecase,
} from 'src/usecases/web/expenses/find-details-expense/find-details-expense.usecase';
import {
  FindDetailsExpenseParms,
  FindDetailsExpenseResponse,
} from './find-details-expense.dto';
import { FindDetailsExpensePresenter } from './find-details-expense.presenter';

@Controller('expenses')
export class FindDetailsExpenseRoute {
  constructor(
    private readonly findDetailsExpenseUsecase: FindDetailsExpenseUsecase,
  ) {}

  @Get(':id')
  async handle(
    @Param() parms: FindDetailsExpenseParms,
  ): Promise<FindDetailsExpenseResponse> {
    const input: FindDetailsExpenseInput = {
      id: parms.id,
    };

    const response = await this.findDetailsExpenseUsecase.execute(input);
    return FindDetailsExpensePresenter.toHttp(response);
  }
}
