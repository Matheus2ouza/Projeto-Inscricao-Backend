import { GenerateReportPdfOutput } from 'src/usecases/web/cash-register/reports/pdf/generate-report/generate-report-pdf.usecase';
import { GenerateReportPdfResponse } from './generate-report-pdf.dto';

export class GenerateReportPdfPresenter {
  public static toHttp(
    output: GenerateReportPdfOutput,
  ): GenerateReportPdfResponse {
    return {
      fileBase64: output.fileBase64,
      filename: output.filename,
      contentType: output.contentType,
    };
  }
}
