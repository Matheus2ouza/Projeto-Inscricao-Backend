import { GeneratePdfSelectedInscriptionOutput } from 'src/usecases/web/event/pdf/generate-pdf-selected-inscriptions/generate-pdf-selected-inscriptions.usecase';
import { GeneratePdfInscriptionResponse } from '../../../inscription/reports/generate-pdf-inscription/generate-pdf-inscription.dto';

export class GeneratePdfSelectedInscriptionPresenter {
  public static toHttp(
    output: GeneratePdfSelectedInscriptionOutput,
  ): GeneratePdfInscriptionResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
