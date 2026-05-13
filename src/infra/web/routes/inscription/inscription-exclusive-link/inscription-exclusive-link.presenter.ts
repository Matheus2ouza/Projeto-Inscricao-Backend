import { InscriptionExclusiveLinkOutput } from 'src/usecases/web/inscription/inscription-exclusive-link/inscription-exclusive-link.usecase';
import { InscriptionExclusiveLinkResponse } from './inscription-exclusive-link.dto';

export class InscriptionExclusiveLinkPresenter {
  public static toHttp(
    output: InscriptionExclusiveLinkOutput,
  ): InscriptionExclusiveLinkResponse {
    return {
      id: output.id,
      status: output.status,
      confirmationCode: output.confirmationCode,
    };
  }
}
