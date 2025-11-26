import { FindTotalInscriptionsUserOutput } from 'src/usecases/web/dashboard/user/find-total-inscriptions.usecase';
import { FindTotalInscriptionsUserResponse } from '../dto/find-total-inscriptions.dto';

export class FindTotalInscriptionsUserPresenter {
  static toHttp(
    output: FindTotalInscriptionsUserOutput,
  ): FindTotalInscriptionsUserResponse {
    return {
      countTotalInscriptions: output.countTotalInscriptions,
      countTotalParticipants: output.countTotalParticipants,
      countPendingInscriptions: output.countPendingInscriptions,
    };
  }
}
