import { FindActiveEventsUserOutput } from 'src/usecases/web/dashboard/user/find-active-events.usecase';
import { FindActiveEventsUserResponse } from '../dto/find-active-events.dto';

export class FindActiveEventsUserPresenter {
  public static tohttp(
    output: FindActiveEventsUserOutput,
  ): FindActiveEventsUserResponse {
    return {
      activeEvents: output.activeEvents,
    };
  }
}
