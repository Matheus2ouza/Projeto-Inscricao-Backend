import { GeneratePdfLocalityOutput } from 'src/usecases/web/participants/reports/pdf/generate-pdf-locality/generate-pdf-locality.usecase';
import { GeneratePdfLocalityResponse } from './generate-pdf-locality.dto';

export class GeneratePdfLocalityPresenter {
  static toHttp(
    output: GeneratePdfLocalityOutput,
  ): GeneratePdfLocalityResponse {
    return {
      fileBase64: output.fileBase64,
      filename: output.filename,
      contentType: output.contentType,
    };
  }
}
