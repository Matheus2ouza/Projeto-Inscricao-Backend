import { ListInscriptionToAnalysisOutput } from 'src/usecases/event/analysis/list-inscription-to-analysis/list-Inscription-to-analysis.usecase';
import { ListInscriptonToAnalysisResponse } from './list-inscription-to-analysis.dto';

export class ListInscriptonToAnalysisPresenter {
  public static toHttp(
    output: ListInscriptionToAnalysisOutput,
  ): ListInscriptonToAnalysisResponse {
    const response: ListInscriptonToAnalysisResponse = {
      account: output.account,
    };
    return response;
  }
}
