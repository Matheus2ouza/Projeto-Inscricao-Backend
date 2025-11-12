import { FindAllNamesEventOutput } from 'src/usecases/web/event/find-all-names/find-all-names.usecase';
import { FindAllNamesEventResponse } from './find-all-names-events.dto';

export class FindAllNamesEventPresenter {
  public static toHttp(
    input: FindAllNamesEventOutput,
  ): FindAllNamesEventResponse {
    return input.map((event) => ({
      id: event.id,
      name: event.name,
    }));
  }
}
