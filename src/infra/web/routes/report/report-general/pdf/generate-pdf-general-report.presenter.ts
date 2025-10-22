import type { GeneratePdfGeneralReportOutput } from 'src/usecases/report/report-general/pdf/generate-pdf-general-report.usecase';
import type { GeneratePdfGeneralReportResponse } from './generate-pdf-general-report.dto';

export class GeneratePdfGeneralReportPresenter {
  public static toHttp(
    output: GeneratePdfGeneralReportOutput,
  ): GeneratePdfGeneralReportResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
