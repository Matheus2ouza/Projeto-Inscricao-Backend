import { FindAllLocalityOutput } from 'src/usecases/web/locality/find-all-by-event/find-all-locality.usecase';
import { FindAllLocalityResponse } from './find-all-locality.dto';

export class FindAllLocalityPresenter {
  public static toHttp(output: FindAllLocalityOutput): FindAllLocalityResponse {
    return output.map((o) => ({
      id: o.id,
      name: o.name,
      uf: o.uf,
    }));
  }
}
