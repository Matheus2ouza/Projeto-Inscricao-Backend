import { FindAllMovimentsCashRegisterOutput } from 'src/usecases/web/cash-register/find-all-moviments-cash-register/find-all-moviments-cash-register.usecase';
import { FindAllMovimentsCashRegisterResponse } from './find-all-moviments-cash-register.dto';

export class FindAllMovimentsCashRegisterPresenter {
  public static toHttp(
    output: FindAllMovimentsCashRegisterOutput,
  ): FindAllMovimentsCashRegisterResponse {
    return {
      moviments: output.moviments,
      totalMoviments: output.totalMoviments,
      totalIncome: output.totalIncome,
      totalExpense: output.totalExpense,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
