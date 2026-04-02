import { GeneratePdfDetailsGuestInscriptionOutput } from 'src/usecases/web/inscription/reports/pdf/generate-pdf-details-guest-inscription/generate-pdf-details-guest-inscription.usecase';
import { GeneratePdfDetailsGuestInscriptionResponse } from './generate-pdf-details-guest-inscription.dto';

export class GeneratePdfDetailsGuestInscriptionPresenter {
  public static toHttp(
    output: GeneratePdfDetailsGuestInscriptionOutput,
  ): GeneratePdfDetailsGuestInscriptionResponse {
    return {
      fileBase64: output.fileBase64,
      filename: output.filename,
      contentType: output.contentType,
    };
  }
}
