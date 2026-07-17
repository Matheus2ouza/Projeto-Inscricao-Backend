import { UpdateInscriptionModeEventOutput } from 'src/usecases/web/event/update-inscription-mode/update-inscription-mode-event.usecase';
import { UpdateInscriptionModeEventResponse } from './update-inscription-mode-event.dto';

export class UpdateInscriptionModeEventPresenter {
  public static toHttp(
    output: UpdateInscriptionModeEventOutput,
  ): UpdateInscriptionModeEventResponse {
    return {
      message: output.message,
      inscriptionMode: output.inscriptionMode,
    };
  }
}
