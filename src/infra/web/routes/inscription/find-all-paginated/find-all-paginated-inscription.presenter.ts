import { FindAllPaginatedInscriptionsOutput } from 'src/usecases/inscription/findAllInscription/find-all-paginated-inscription.usecase';
import { FindAllPaginatedInscriptionResponse } from './find-all-paginated-inscription.dto';

export class FindAllPaginatedInscriptionPresenter {
  public static toHttp(
    input: FindAllPaginatedInscriptionsOutput,
  ): FindAllPaginatedInscriptionResponse {
    return {
      inscription: input.inscription,
      total: input.total,
      page: input.page,
      pageCount: input.pageCount,
      totalInscription: input.totalInscription,
      totalParticipant: input.totalParticipant,
      totalDebt: input.totalDebt,
    };
  }
}
