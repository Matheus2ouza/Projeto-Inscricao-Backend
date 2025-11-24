import { FindActiveParticipantsOutput } from 'src/usecases/web/dashboard/admin/find-active-participants.usecase';
import { FindActiveParticipantsResponse } from '../dto/find-active-participants.dto';

export class FindActiveParticipantsPresenter {
  static tohttp(
    output: FindActiveParticipantsOutput,
  ): FindActiveParticipantsResponse {
    return {
      activeParticipants: output.countParticipants,
    };
  }
}
