import { FindAllByEventOutput } from 'src/usecases/web/locality/find-all-by-event/find-all-by-event.usecase';
import { FindAllByEventResponse } from './find-all-by-event.dto';

export class FindAllByEventPresenter {
  public static toHttp(output: FindAllByEventOutput): FindAllByEventResponse {
    return output.map((o) => ({
      id: o.id,
      name: o.name,
      uf: o.uf,
    }));
  }
}
