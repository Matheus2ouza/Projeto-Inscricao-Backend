import { GeneratePdfExpensesOutput } from 'src/usecases/web/expenses/reports/pdf/generate-pdf-expenses/generate-pdf-expenses.usecase';
import { GeneratePdfExpensesResponse } from './generate-pdf-expenses.dto';

export class GeneratePdfExpensesPresenter {
  public static toHttp(
    output: GeneratePdfExpensesOutput,
  ): GeneratePdfExpensesResponse {
    return {
      fileBase64: output.fileBase64,
      filename: output.filename,
      contentType: output.contentType,
    };
  }
}
