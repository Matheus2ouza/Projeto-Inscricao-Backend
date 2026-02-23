import { GeneratePdfAllInscriptionsOutput } from 'src/usecases/web/inscription/pdf/generate-pdf-all-inscriptions/generate-pdf-all-inscriptions.usecase';
import { GeneratePdfAllInscriptionsResponse } from './generate-pdf-all-inscriptions.dto';

export class GeneratePdfAllInscriptionsPresenter {
  public static toHttp(
    output: GeneratePdfAllInscriptionsOutput,
  ): GeneratePdfAllInscriptionsResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
