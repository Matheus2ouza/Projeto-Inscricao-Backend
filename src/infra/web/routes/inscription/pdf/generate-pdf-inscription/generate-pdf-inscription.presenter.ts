import { GeneratePdfInscriptionOutput } from 'src/usecases/inscription/pdf/generate-pdf-inscription/generate-pdf-inscription.usecase';
import { GeneratePdfInscriptionResponse } from './generate-pdf-inscription.dto';

export class GeneratePdfInscriptionPresenter {
  public static toHttp(
    output: GeneratePdfInscriptionOutput,
  ): GeneratePdfInscriptionResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
