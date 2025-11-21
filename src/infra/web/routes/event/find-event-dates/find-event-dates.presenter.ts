import { FindEventDateOutput } from 'src/usecases/web/event/find-event-dates/find-event-dates.usecase';
import { FindEventDateResponse } from './find-event-dates.dto';

export class FindEventDatePresenter {
  public static toHttp(output: FindEventDateOutput): FindEventDateResponse {
    return {
      events: output.events,
    };
  }
}
