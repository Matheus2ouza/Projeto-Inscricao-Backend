import { AnalysisPaymentOutput } from 'src/usecases/web/paymentInscription/analysis/analysis-payment/analysis-payment.usecase';
import { AnalysisPaymentResponse } from './analysis-payment.dto';

export class AnalysisPaymentPresenter {
  public static toHttp(output: AnalysisPaymentOutput): AnalysisPaymentResponse {
    return {
      inscription: output.inscription,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
