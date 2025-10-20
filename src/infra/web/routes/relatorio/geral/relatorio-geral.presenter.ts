import type { RelatorioGeralOutput } from 'src/usecases/relatorio/geral/relatorio-geral.usecase';
import type { RelatorioGeralResponse } from './relatorio-geral.dto';

export class RelatorioGeralPresenter {
  public static toHttp(output: RelatorioGeralOutput): RelatorioGeralResponse {
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
