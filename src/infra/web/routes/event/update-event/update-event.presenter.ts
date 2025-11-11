import { UpdateEventOutput } from 'src/usecases/event/update-event/update-event.usecase';
import { UpdateEventRouteResponse } from './update-event.dto';

export class UpdateEventPresenter {
  public static toHttp(input: UpdateEventOutput): UpdateEventRouteResponse {
    const response: UpdateEventRouteResponse = {
      id: input.id,
    };
    return response;
  }
}
