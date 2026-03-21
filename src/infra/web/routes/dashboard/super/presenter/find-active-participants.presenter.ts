import { FindActiveParticipantsAdminOutput } from 'src/usecases/web/dashboard/admin/find-active-participants.usecase';
import { FindActiveParticipantsSuperResponse } from '../dto/find-active-participants.dto';

export class FindActiveParticipantsSuperPresenter {
  static tohttp(
    output: FindActiveParticipantsAdminOutput,
  ): FindActiveParticipantsSuperResponse {
    return {
      activeParticipants: output.countParticipants,
    };
  }
}
