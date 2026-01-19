import { FindAllPaginatedInscriptionOutput } from 'src/usecases/web/inscription/find-all-inscription/find-all-paginated-inscription.usecase';
import { FindAllPaginatedInscriptionResponse } from './find-all-paginated-inscription.dto';

export class FindAllPaginatedInscriptionPresenter {
  public static toHttp(
    output: FindAllPaginatedInscriptionOutput,
  ): FindAllPaginatedInscriptionResponse {
    return {
      event: output.event,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
