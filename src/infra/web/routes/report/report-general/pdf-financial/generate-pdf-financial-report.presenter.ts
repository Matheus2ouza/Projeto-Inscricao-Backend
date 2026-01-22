import { GeneratePdfFinancialReportOutput } from 'src/usecases/web/report/report-general/pdf-financial/generate-pdf-financial-report.usecase';
import { GeneratePdfFinancialReportResponse } from './generate-pdf-financial-report.dto';

export class GeneratePdfFinancialReportPresenter {
  public static toHttp(
    output: GeneratePdfFinancialReportOutput,
  ): GeneratePdfFinancialReportResponse {
    return {
      pdfBase64: output.pdfBase64,
      filename: output.filename,
    };
  }
}
