import { GenerateReportPdfOutput } from 'src/usecases/web/cash-register/pdf/generate-report/generate-report-pdf.usecase';
import { GenerateReportPdfResponse } from './generate-report-pdf.dto';

export class GenerateReportPdfPresenter {
  public static toHttp(
    output: GenerateReportPdfOutput,
  ): GenerateReportPdfResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
