import { ListGuestParticipantsOutput } from 'src/usecases/web/participants/list-guest-participants/list-guest-participants.usecase';
import { ListGuestParticipantsResponse } from './list-guest-participants.dto';

export class ListGuestParticipantsPresenter {
  static toHttp(
    output: ListGuestParticipantsOutput,
  ): ListGuestParticipantsResponse {
    return {
      guestParticipants: output.guestParticipants,
      countGuestParticipants: output.countGuestParticipants,
      countGuestParticipantsMale: output.countGuestParticipantsMale,
      countGuestParticipantsFemale: output.countGuestParticipantsFemale,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
