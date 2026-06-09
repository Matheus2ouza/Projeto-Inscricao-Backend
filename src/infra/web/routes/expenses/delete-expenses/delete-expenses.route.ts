import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import {
  DeleteExpenseInput,
  DeleteExpenseUsecase,
} from 'src/usecases/web/expenses/delete-expenses/delete-expenses.usecase';
import { DeleteExpenseParams } from './delete-expenses.dto';

@Controller('expenses')
export class DeleteExpenseRoute {
  constructor(private readonly deleteExpenseUsecase: DeleteExpenseUsecase) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Param() params: DeleteExpenseParams) {
    const input: DeleteExpenseInput = {
      id: params.id,
    };

    await this.deleteExpenseUsecase.execute(input);
  }
}
