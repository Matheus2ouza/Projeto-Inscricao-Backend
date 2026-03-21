import { FindTotalDebtAdminOutput } from 'src/usecases/web/dashboard/admin/find-total-debt.usecase';
import { FindTotalDebtResponse } from '../dto/find-total-debt.dto';

export class FindTotalDebtAdminPresenter {
  static tohttp(output: FindTotalDebtAdminOutput): FindTotalDebtResponse {
    return { totalDebt: output.totalDebt };
  }
}
