import { FindDetailsInscriptionOutput } from 'src/usecases/web/inscription/find-details-inscription/find-details-inscription.usecase';
import { FindDetailsInscriptionResponse } from './find-details-inscription.dto';

export class FindDetailsInscriptionPresenter {
  public static toHttp(
    input: FindDetailsInscriptionOutput,
  ): FindDetailsInscriptionResponse {
    const aInscription: FindDetailsInscriptionResponse = {
      inscription: input.inscription,
      participants: input.participants,
      payments: input.payments,
    };
    return aInscription;
  }
}
