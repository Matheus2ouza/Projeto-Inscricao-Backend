import { FindDetailsExpenseOutput } from 'src/usecases/web/expenses/find-details-expense/find-details-expense.usecase';
import { FindDetailsExpenseResponse } from './find-details-expense.dto';

export class FindDetailsExpensePresenter {
  public static toHttp(
    output: FindDetailsExpenseOutput,
  ): FindDetailsExpenseResponse {
    return {
      id: output.id,
      description: output.description,
      value: output.value,
      paymentMethod: output.paymentMethod,
      responsible: output.responsible,
      category: output.category,
      images: output.images,
      createdAt: output.createdAt,
    };
  }
}
