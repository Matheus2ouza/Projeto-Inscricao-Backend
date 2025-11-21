import { FindActiveEventsOutput } from 'src/usecases/web/dashboard/admin/find-active-events.usecase';
import { FindActiveEventsResponse } from '../dto/find-active-events.dto';

export class FindActiveEventsPresenter {
  public static tohttp(
    output: FindActiveEventsOutput,
  ): FindActiveEventsResponse {
    return {
      countEventsActive: output.countEventsActive,
    };
  }
}
