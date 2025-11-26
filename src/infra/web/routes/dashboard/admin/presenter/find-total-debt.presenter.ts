import { FindTotalDebtAdminOutput } from 'src/usecases/web/dashboard/admin/find-total-debt.usecase';
import { FindTotalDebtAdminResponse } from '../dto/find-total-debt.dto';

export class FindTotalDebtAdminPresenter {
  static tohttp(output: FindTotalDebtAdminOutput): FindTotalDebtAdminResponse {
    return { totalDebt: output.totalDebt };
  }
}
