import { ListInscriptionOutput } from 'src/usecases/event/list-inscription/list-Inscription.usecase';
import { ListInscriptionResponse } from './list-Inscription.dto';

export class ListInscriptionPresenter {
  public static toHttp(input: ListInscriptionOutput): ListInscriptionResponse {
    return {
      id: input.id,
      name: input.name,
      quantityParticipants: input.quantityParticipants,
      inscriptions: input.inscriptions,
      total: input.total,
      page: input.page,
      pageCount: input.pageCount,
    };
  }
}
