import { AnalysisPaymentsPendingOutput } from 'src/usecases/web/payments/analysis-payments-pending/analysis-payments-pending.usecase';
import { AnalysisPaymentsPendingResponse } from './analysis-payments-pending.dto';

export class AnalysisPaymentsPendingPresenter {
  public static toHttp(
    output: AnalysisPaymentsPendingOutput,
  ): AnalysisPaymentsPendingResponse {
    return {
      event: output.event,
      payments: output.payments,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
