import { UpdateLocationEventOutput } from 'src/usecases/web/event/update-location/update-location-event.usecase';
import { UpdateLocationEventResponse } from './update-location-event.dto';

export class UpdateLocationEventPresenter {
  public static toHttp(
    output: UpdateLocationEventOutput,
  ): UpdateLocationEventResponse {
    return {
      id: output.id,
    };
  }
}
