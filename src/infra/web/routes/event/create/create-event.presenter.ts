import { CreateEventOutput } from 'src/usecases/web/event/create/create-event.usecase';
import { CreateEventRouteResponse } from './create-event.dto';

export class CreateEventPresenter {
  public static toHttp(input: CreateEventOutput): CreateEventRouteResponse {
    const response: CreateEventRouteResponse = {
      id: input.id,
    };
    return response;
  }
}
