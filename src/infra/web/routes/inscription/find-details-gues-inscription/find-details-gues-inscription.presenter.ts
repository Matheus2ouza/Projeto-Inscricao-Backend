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
      phone: output.phone,
      createdAt: output.createdAt,
      totalValue: output.totalValue,
      totalPaid: output.totalPaid,
      locality: output.locality,
      participant: output.participant,
      payments: output.payments,
      eventConfig: output.eventConfig,
    };
  }
}
