import { ReportFinancialOutput } from 'src/usecases/web/report/report-general/financial/report-financial.usecase';
import { ReportFinancialResponse } from './report-financial.dto';

export class ReportFinancialPresenter {
  public static toHttp(output: ReportFinancialOutput): ReportFinancialResponse {
    return {
      id: output.id,
      name: output.name,
      startDate: output.startDate,
      endDate: output.endDate,
      image: output.image,
      logo: output.logo,
      totalGeral: output.totalGeral,
      totalCash: output.totalCash,
      totalCard: output.totalCard,
      totalPix: output.totalPix,
      totalSpent: output.totalSpent,
      inscription: output.inscription,
      inscriptionAvuls: output.inscriptionAvuls,
      ticketsSale: output.ticketsSale,
      spent: output.spent,
    };
  }
}
