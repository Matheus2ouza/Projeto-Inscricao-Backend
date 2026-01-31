import { FindDetailsGuestInscriptionOutput } from 'src/usecases/web/inscription/find-details-gues-inscription/find-details-gues-inscription';
import { FindDetailsGuestInscriptionResponse } from './find-details-gues-inscription.dto';

export class FindDetailsGuestInscriptionPresenter {
  public static toHttp(
    output: FindDetailsGuestInscriptionOutput,
  ): FindDetailsGuestInscriptionResponse {
    return {
      id: output.id,
      status: output.status,
      guestEmail: output.guestEmail,
      guestName: output.guestName,
      guestLocality: output.guestLocality,
      phone: output.phone,
      createdAt: output.createdAt,
      participants: output.participants,
      payment: output.payment,
    };
  }
}
