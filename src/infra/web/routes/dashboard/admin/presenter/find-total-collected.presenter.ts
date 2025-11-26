import { FindTotalCollectedAdminOutput } from 'src/usecases/web/dashboard/admin/find-total-collected.usecase';
import { FindTotalCollectedAdminResponse } from '../dto/find-total-collected.dto';

export class FindTotalCollectedAdminPresenter {
  static tohttp(
    output: FindTotalCollectedAdminOutput,
  ): FindTotalCollectedAdminResponse {
    return { totalCollected: output.totalCollected };
  }
}
