import { GenerateXlsxLocalityOutput } from 'src/usecases/web/participants/reports/xlsx/generate-xlsx-locality/generate-xlsx-locality.usecase';
import { GenerateXlsxLocalityResponse } from './generate-pdf-locality.dto';

export class GenerateXlsxLocalityPresenter {
  public static toHttp(
    output: GenerateXlsxLocalityOutput,
  ): GenerateXlsxLocalityResponse {
    return {
      fileBase64: output.fileBase64,
      filename: output.filename,
      contentType: output.contentType,
    };
  }
}
