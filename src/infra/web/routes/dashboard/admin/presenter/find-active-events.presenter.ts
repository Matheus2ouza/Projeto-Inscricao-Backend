import { FindActiveEventsAdminOutput } from 'src/usecases/web/dashboard/admin/find-active-events.usecase';
import { FindActiveEventsAdminResponse } from '../dto/find-active-events.dto';

export class FindActiveEventsAdminPresenter {
  public static tohttp(
    output: FindActiveEventsAdminOutput,
  ): FindActiveEventsAdminResponse {
    return {
      activeEvents: output.countEventsActive,
    };
  }
}
