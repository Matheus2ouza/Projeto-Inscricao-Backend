import { GenerateXlsxAllInscriptionsOutput } from 'src/usecases/web/inscription/reports/xlsx/generate-xlsx-all-inscriptions/generate-xlsx-all-inscriptions.usecase';
import { GenerateXlsxAllInscriptionsResponse } from './generate-xlsx-all-inscriptions.dto';

export class GenerateXlsxAllInscriptionsPresenter {
  public static toHttp(
    output: GenerateXlsxAllInscriptionsOutput,
  ): GenerateXlsxAllInscriptionsResponse {
    return {
      fileBase64: output.fileBase64,
      filename: output.filename,
      contentType: output.contentType,
    };
  }
}
