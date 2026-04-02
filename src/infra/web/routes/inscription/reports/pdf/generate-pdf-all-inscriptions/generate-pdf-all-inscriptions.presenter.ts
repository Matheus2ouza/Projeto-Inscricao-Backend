import { GeneratePdfAllInscriptionsOutput } from 'src/usecases/web/inscription/reports/pdf/generate-pdf-all-inscriptions/generate-pdf-all-inscriptions.usecase';
import { GenerateAllInscriptionsResponse } from './generate-pdf-all-inscriptions.dto';

export class GenerateAllInscriptionsPresenter {
  public static toHttp(
    output: GeneratePdfAllInscriptionsOutput,
  ): GenerateAllInscriptionsResponse {
    return {
      fileBase64: output.fileBase64,
      filename: output.filename,
      contentType: output.contentType,
    };
  }
}
