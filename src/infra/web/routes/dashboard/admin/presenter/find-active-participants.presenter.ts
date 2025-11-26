import { FindActiveParticipantsAdminOutput } from 'src/usecases/web/dashboard/admin/find-active-participants.usecase';
import { FindActiveParticipantsAdminResponse } from '../dto/find-active-participants.dto';

export class FindActiveParticipantsAdminPresenter {
  static tohttp(
    output: FindActiveParticipantsAdminOutput,
  ): FindActiveParticipantsAdminResponse {
    return {
      activeParticipants: output.countParticipants,
    };
  }
}
