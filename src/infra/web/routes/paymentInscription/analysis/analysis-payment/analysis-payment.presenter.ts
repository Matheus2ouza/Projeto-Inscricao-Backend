import { AnalysisPaymentOutput } from 'src/usecases/paymentInscription/analysis/analysis-payment/analysis-payment.usecase';
import { AnalysisPaymentResponse } from './analysis-payment.dto';

export class AnalysisPaymentPresenter {
  public static toHttp(output: AnalysisPaymentOutput): AnalysisPaymentResponse {
    return {
      id: output.id,
      responsible: output.responsible,
      phone: output.phone,
      email: output.email,
      totalValue: output.totalValue,
      payments: output.payments,
    };
  }
}
