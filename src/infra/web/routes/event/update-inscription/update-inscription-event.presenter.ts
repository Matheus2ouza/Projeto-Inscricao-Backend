import { UpdateInscriptionEventOutput } from 'src/usecases/event/update-inscription/update-inscription-event.usecase';
import { UpdateInscriptionEventResponse } from './update-inscription-event.dto';

export class UpdateInscriptionEventPresenter {
  public static toHttp(
    input: UpdateInscriptionEventOutput,
  ): UpdateInscriptionEventResponse {
    const response: UpdateInscriptionEventResponse = {
      id: input.eventId,
      InscriptionStatus: input.InscriptionStatus,
    };

    return response;
  }
}
