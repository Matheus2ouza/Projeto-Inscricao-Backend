import { UpdateImageEventOutput } from 'src/usecases/event/update-image/update-image-event.usecase';
import { UpdateImageResponse } from './update-image.dto';

export class UpdateImagePresenter {
  public static toHttp(input: UpdateImageEventOutput): UpdateImageResponse {
    const response: UpdateImageResponse = {
      id: input.id,
    };
    return response;
  }
}
