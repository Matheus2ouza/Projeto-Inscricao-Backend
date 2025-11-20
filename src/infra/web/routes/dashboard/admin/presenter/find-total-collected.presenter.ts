import { FindTotalCollectedOutput } from 'src/usecases/web/dashboard/admin/find-total-collected.usecase';
import { FindTotalCollectedResponse } from '../dto/find-total-collected.dto';

export class FindTotalCollectedPresenter {
  static tohttp(output: FindTotalCollectedOutput): FindTotalCollectedResponse {
    return { totalCollected: output.totalCollected };
  }
}
