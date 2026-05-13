import { PreviewExclusiveInscriptionLinkOutput } from 'src/usecases/web/exclusive-inscription-link/preview-exclusive-inscription-link/preview-exclusive-inscription-link.usecase';
import { PreviewExclusiveInscriptionLinkResponse } from './preview-exclusive-inscription-link.dto';

export class PreviewExclusiveInscriptionLinkPresenter {
  public static toHttp(
    output: PreviewExclusiveInscriptionLinkOutput,
  ): PreviewExclusiveInscriptionLinkResponse {
    return {
      event: output.event,
      exclusiveInscriptionLink: output.exclusiveInscriptionLink,
      status: output.status,
      canInscribe: output.canInscribe,
    };
  }
}
