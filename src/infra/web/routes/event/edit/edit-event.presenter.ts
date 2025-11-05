import { EditEventOutput } from 'src/usecases/event/edit/edit-event.usecase';
import { EditEventRouteResponse } from './edit-event.dto';

export class EditEventPresenter {
  public static toHttp(input: EditEventOutput): EditEventRouteResponse {
    const response: EditEventRouteResponse = {
      id: input.id,
    };
    return response;
  }
}
