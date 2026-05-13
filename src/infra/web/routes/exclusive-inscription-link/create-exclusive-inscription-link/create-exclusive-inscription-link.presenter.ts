import { CreateExclusiveInscriptionLinkOutput } from 'src/usecases/web/exclusive-inscription-link/create-exclusive-inscription-link/create-exclusive-inscription-link.usecase';
import { CreateExclusiveInscriptionLinkResponse } from './create-exclusive-inscription-link.dto';

export class CreateExclusiveInscriptionLinkPresenter {
  public static toHttp(
    output: CreateExclusiveInscriptionLinkOutput,
  ): CreateExclusiveInscriptionLinkResponse {
    return {
      id: output.id,
    };
  }
}
