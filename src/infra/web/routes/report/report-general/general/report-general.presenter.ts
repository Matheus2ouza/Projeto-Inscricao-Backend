import type { ReportGeneralOutput } from 'src/usecases/web/report/report-general/general/report-general.usecase';
import type { ReportGeneralResponse } from './report-general.dto';

export class RelatorioGeralPresenter {
  public static toHttp(output: ReportGeneralOutput): ReportGeneralResponse {
    return {
      event: output.event,
      totais: output.totais,
      inscricoes: output.inscricoes,
      inscricoesAvulsas: output.inscricoesAvulsas,
      tickets: output.tickets,
      gastos: output.gastos,
    };
  }
}
