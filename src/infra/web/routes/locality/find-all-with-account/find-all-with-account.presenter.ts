import { FindAllLocalityWithAccountOutput } from 'src/usecases/web/locality/find-all-with-account/find-all-with-account.usecase';
import { FindAllLocalityWithAccountResponse } from './find-all-with-account.dto';

export class FindAllLocalityWithAccountPresenter {
  public static toHttp(
    output: FindAllLocalityWithAccountOutput,
  ): FindAllLocalityWithAccountResponse {
    return output.map((o) => {
      return {
        id: o.id,
        name: o.name,
        uf: o.uf,
      };
    });
  }
}
