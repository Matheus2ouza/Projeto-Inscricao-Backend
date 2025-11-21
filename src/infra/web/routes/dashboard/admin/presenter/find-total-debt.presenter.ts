import { FindTotalDebtOutput } from 'src/usecases/web/dashboard/admin/find-total-debt.usecase';
import { FindTotalDebtResponse } from '../dto/find-total-debt.dto';

export class FindTotalDebtPresenter {
  static tohttp(output: FindTotalDebtOutput): FindTotalDebtResponse {
    return { totalDebt: output.totalDebt };
  }
}
