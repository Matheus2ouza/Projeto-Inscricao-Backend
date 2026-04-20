import { FindAllInscriptionOutput } from 'src/usecases/web/inscription/find-all-inscription/find-all-inscription.usecase';
import { FindAllInscriptionResponse } from './find-all-inscription.dto';

export class FindAllInscriptionPresenter {
  public static toHttp(
    output: FindAllInscriptionOutput,
  ): FindAllInscriptionResponse {
    return output.map((inscription) => ({
      id: inscription.id,
      responsible: inscription.responsible,
      status: inscription.status,
      totalValue: inscription.totalValue,
      totalPaid: inscription.totalPaid,
    }));
  }
}
