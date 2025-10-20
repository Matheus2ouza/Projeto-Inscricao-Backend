import type { GerarPdfRelatorioOutput } from 'src/usecases/relatorio/pdf/gerar-pdf-relatorio.usecase';
import type { GerarPdfRelatorioResponse } from './gerar-pdf-relatorio.dto';

export class GerarPdfRelatorioPresenter {
  public static toHttp(
    output: GerarPdfRelatorioOutput,
  ): GerarPdfRelatorioResponse {
    return {
      pdfBuffer: output.pdfBuffer,
      filename: output.filename,
    };
  }
}
