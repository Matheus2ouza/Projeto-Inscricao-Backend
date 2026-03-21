import { FindTotalCollectedSuperOutput } from 'src/usecases/web/dashboard/super/find-total-collected.usecase';
import { FindTotalCollectedSuperResponse } from '../dto/find-total-collected.dto';

export class FindTotalCollectedSuperPresenter {
  static tohttp(
    output: FindTotalCollectedSuperOutput,
  ): FindTotalCollectedSuperResponse {
    return {
      totalCollected: output.totalCollected,
      totalNetValueCollected: output.totalNetValueCollected,
    };
  }
}
