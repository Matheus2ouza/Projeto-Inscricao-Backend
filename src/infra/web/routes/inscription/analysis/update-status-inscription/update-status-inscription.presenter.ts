import { UpdateStatusInscriptionOutput } from "src/usecases/inscription/analysis/update-status-inscription/update-status-inscription.usecase";
import { UpdateStatusInscriptionResponse } from "./update-status-inscription.dto";

export class UpdateStatusInscriptionPresenter {
  public static toHttp(output: UpdateStatusInscriptionOutput): UpdateStatusInscriptionResponse {
    return {
      id: output.id,
      status: output.status
    }
  }
}
