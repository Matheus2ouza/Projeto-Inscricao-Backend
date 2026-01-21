import { AnalysisPaymentsPendingDetailsOutput } from 'src/usecases/web/payments/analysis-payments-pending-details/analysis-payments-pending-details.usecase';
import { AnalysisPaymentsPendingDetailsResponse } from './analysis-payments-pending-details.dto';

export class AnalysisPaymentsPendingDetailsPresenter {
  public static toHttp(
    output: AnalysisPaymentsPendingDetailsOutput,
  ): AnalysisPaymentsPendingDetailsResponse {
    return {
      id: output.id,
      status: output.status,
      methodPayment: output.methodPayment,
      totalValue: output.totalValue,
      createdAt: output.createdAt,
      imageUrl: output.imageUrl,
      rejectionReason: output.rejectionReason,
      allocation: output.allocation,
    };
  }
}
