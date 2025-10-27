import { AnalysisInscriptionOutput } from 'src/usecases/inscription/analysis/analysis-inscription/analysis-inscription.usecase';
import { AnalysisInscriptionResponse } from './analysis-inscription.dto';

export class AnalysisInscriptionPresenter {
  public static toHttp(
    input: AnalysisInscriptionOutput,
  ): AnalysisInscriptionResponse {
    return {
      id: input.id,
      responsible: input.responsible,
      email: input.email,
      phone: input.phone,
      status: input.status,
      participants: input.participants,
      total: input.total,
      page: input.page,
      pageCount: input.pageCount,
    };
  }
}
