import { FindDetailsInscriptionAvulOutput } from 'src/usecases/web/inscription/avul/find-details-inscription-avul/find-details-inscription-avul.usecase';
import { FindDetailsInscriptionAvulResponse } from './find-details-inscription-avul.dto';

export class FindDetailsInscriptionAvulPresenter {
  public static toHttp(
    output: FindDetailsInscriptionAvulOutput,
  ): FindDetailsInscriptionAvulResponse {
    return {
      id: output.id,
      name: output.name,
      createdAt: output.createdAt,
      onSiteParticipant: output.onSiteParticipan,
    };
  }
}
