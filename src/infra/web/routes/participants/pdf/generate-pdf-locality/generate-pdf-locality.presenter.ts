import { GeneratePdfLocalityOutput } from 'src/usecases/web/participants/pdf/generate-pdf-locality/generate-pdf-locality.usecase';
import { GeneratePdfLocalityResponse } from './generate-pdf-locality.dto';

export class GeneratePdfLocalityPresenter {
  static toHttp(
    output: GeneratePdfLocalityOutput,
  ): GeneratePdfLocalityResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
