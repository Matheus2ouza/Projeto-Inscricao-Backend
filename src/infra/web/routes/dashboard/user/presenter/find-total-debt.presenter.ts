import { FindTotalDebtUserOutput } from 'src/usecases/web/dashboard/user/find-total-debt.usecase';
import { FindTotalDebtUserResponse } from '../dto/find-total-debt.dto';

export class FindTotalDebtUserPresenter {
  static toHttp(output: FindTotalDebtUserOutput): FindTotalDebtUserResponse {
    return {
      countTotalDebt: output.countTotalDebt,
      countTotalPaid: output.countTotalPaid,
      debtCompletionPercentage: output.debtCompletionPercentage,
    };
  }
}
