import type { ReportGeneralOutput } from 'src/usecases/web/report/report-general/general/report-general.usecase';
import type { ReportGeneralResponse } from './report-general.dto';

export class RelatorioGeralPresenter {
  public static toHttp(output: ReportGeneralOutput): ReportGeneralResponse {
    return {
      id: output.id,
      name: output.name,
      startDate: output.startDate,
      endDate: output.endDate,
      image: output.image,
      totalInscriptions: output.totalInscriptions,
      countTypeInscription: output.countTypeInscription,
      countParticipants: output.countParticipants,
      totalValue: output.totalValue,
      totalDebt: output.totalDebt,
      typeInscription: output.typeInscription,
    };
  }
}
