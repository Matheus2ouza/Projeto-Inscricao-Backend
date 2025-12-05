import { GeneratePdfEtiquetaOutput } from 'src/usecases/web/participants/pdf/generate-pdf-etiqueta/generate-pdf-etiqueta.usecase';
import { GeneratePdfEtiquetaResponse } from './generate-pdf-etiqueta.dto';

export class GeneratePdfEtiquetaPresenter {
  public static toHttp(
    output: GeneratePdfEtiquetaOutput,
  ): GeneratePdfEtiquetaResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
