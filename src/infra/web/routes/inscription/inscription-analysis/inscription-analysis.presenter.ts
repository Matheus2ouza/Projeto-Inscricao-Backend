import { InscriptionAnalysisOutput } from 'src/usecases/inscription/inscription-analysis/inscription-analysis.usecase';
import { InscriptionAnalysisResponse } from './inscription-analysis.dto';

export class InscriptionAnalysisPresenter {
  public static toHttp(
    output: InscriptionAnalysisOutput,
  ): InscriptionAnalysisResponse {
    const response: InscriptionAnalysisResponse = {
      account: output.account,
    };
    return response;
  }
}
