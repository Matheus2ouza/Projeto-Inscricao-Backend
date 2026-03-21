import { FindActiveParticipantsAdminOutput } from 'src/usecases/web/dashboard/admin/find-active-participants.usecase';
import { FindActiveParticipantsResponse } from '../dto/find-active-participants.dto';

export class FindActiveParticipantsAdminPresenter {
  static tohttp(
    output: FindActiveParticipantsAdminOutput,
  ): FindActiveParticipantsResponse {
    return {
      activeParticipants: output.countParticipants,
    };
  }
}
