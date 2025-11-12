import { FindDetailsInscriptionOutput } from 'src/usecases/web/inscription/find-details-inscription/find-details-inscription.usecase';
import { FindDetailsInscriptionResponse } from './find-details-inscription.dto';

export class FindDetailsInscriptionPresenter {
  public static toHttp(
    input: FindDetailsInscriptionOutput,
  ): FindDetailsInscriptionResponse {
    const aInscription: FindDetailsInscriptionResponse = {
      id: input.id,
      responsible: input.responsible,
      phone: input.phone,
      email: input.email,
      totalValue: input.totalValue,
      status: input.status,
      createdAt: input.createdAt,
      payments: input.payments,
      participants: input.participants,
      countParticipants: input.countParticipants,
    };
    return aInscription;
  }
}
