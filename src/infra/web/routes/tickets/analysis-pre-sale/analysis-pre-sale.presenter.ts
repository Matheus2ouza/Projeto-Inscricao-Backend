import { AnalysisPreSaleOutput } from 'src/usecases/web/tickets/analysis-pre-sale/analysis-pre-sale.usecase';
import { AnalysisPreSaleResponse } from './analysis-pre-sale.dto';

export class AnalysisPreSalePresenter {
  public static toHttp(output: AnalysisPreSaleOutput): AnalysisPreSaleResponse {
    return {
      event: output.event,
      total: output.total,
      page: output.page,
      pageCount: output.pageCount,
    };
  }
}
