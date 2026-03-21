import { FindTotalDebtAdminOutput } from 'src/usecases/web/dashboard/admin/find-total-debt.usecase';
import { FindTotalDebtSuperResponse } from '../dto/find-total-debt.dto';

export class FindTotalDebtSuperPresenter {
  static tohttp(output: FindTotalDebtAdminOutput): FindTotalDebtSuperResponse {
    return { totalDebt: output.totalDebt };
  }
}
