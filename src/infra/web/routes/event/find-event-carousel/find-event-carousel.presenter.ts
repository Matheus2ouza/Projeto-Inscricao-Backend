import { FindEventCarouselOutput } from 'src/usecases/web/event/find-event-carousel/find-event-carousel.usecase';
import { FindEventCarouselResponse } from './find-event-carousel.dto';

export class FindEventCarousePresenter {
  public static toHttp(
    input: FindEventCarouselOutput,
  ): FindEventCarouselResponse {
    return input.map((event) => ({
      id: event.id,
      name: event.name,
      location: event.location,
      image: event.image,
    }));
  }
}
