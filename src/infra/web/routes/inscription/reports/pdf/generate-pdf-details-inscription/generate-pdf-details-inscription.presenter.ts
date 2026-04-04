import { GeneratePdfDetailsInscriptionOutput } from 'src/usecases/web/inscription/reports/pdf/generate-pdf-details-guest-inscription/generate-pdf-details-guest-inscription.usecase';
import { GeneratePdfDetailsInscriptionResponse } from './generate-pdf-details-inscription.dto';

export class GeneratePdfDetailsInscriptionPresenter {
  public static toHttp(
    output: GeneratePdfDetailsInscriptionOutput,
  ): GeneratePdfDetailsInscriptionResponse {
    return {
      fileBase64: output.fileBase64,
      filename: output.filename,
      contentType: output.contentType,
    };
  }
}
