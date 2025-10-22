import type { GeneratePdfGeneralReportOutput } from 'src/usecases/report/report-general/pdf/generate-pdf-general-report.usecase';
import type { GeneratePdfGeneralReportResponse } from './generate-pdf-general-report.dto';

export class GeneratePdfGeneralReportPresenter {
  public static toHttp(
    output: GeneratePdfGeneralReportOutput,
  ): GeneratePdfGeneralReportResponse {
    return {
      pdfBuffer: output.pdfBuffer,
      filename: output.filename,
    };
  }
}
