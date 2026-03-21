import { GeneratePdfAllInscriptionsOutput } from 'src/usecases/web/inscription/reports/pdf/generate-pdf-all-inscriptions/generate-pdf-all-inscriptions.usecase';
import { GenerateAllInscriptionsResponse } from './generate-all-inscriptions.dto';

export class GenerateAllInscriptionsPresenter {
  public static toHttp(
    output: GeneratePdfAllInscriptionsOutput,
  ): GenerateAllInscriptionsResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
