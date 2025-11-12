import { ListPaymentToAnalysisOutput } from 'src/usecases/web/event/analysis/list-payment-to-analysis/list-payment-to-analysis.usecase';
import { ListPaymentToAnalysisResponse } from './list-payment-to-analysis.dto';

export class ListPaymentToAnalysisPresenter {
  public static toHttp(
    output: ListPaymentToAnalysisOutput,
  ): ListPaymentToAnalysisResponse {
    return {
      account: output.account,
    };
  }
}
