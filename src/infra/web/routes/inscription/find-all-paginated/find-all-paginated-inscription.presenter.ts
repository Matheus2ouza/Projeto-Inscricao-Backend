import { FindAllPaginatedInscriptionsOutput } from 'src/usecases/inscription/find-all-inscription/find-all-paginated-inscription.usecase';
import { FindAllPaginatedInscriptionResponse } from './find-all-paginated-inscription.dto';

export class FindAllPaginatedInscriptionPresenter {
  public static toHttp(
    output: FindAllPaginatedInscriptionsOutput,
  ): FindAllPaginatedInscriptionResponse {
    return {
      events: output.events,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
      totalInscription: output.totalInscription,
      totalParticipant: output.totalParticipant,
      totalDebt: output.totalDebt,
    };
  }
}
