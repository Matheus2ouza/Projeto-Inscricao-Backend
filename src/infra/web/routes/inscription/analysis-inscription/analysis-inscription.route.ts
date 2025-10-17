import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalysisInscriptionUsecase } from 'src/usecases/inscription/analysis-inscription/analysis-inscription.usecase';
import type {
  AnalysisInscriptionRequest,
  AnalysisInscriptionResponse,
} from './analysis-inscription.dto';
import { AnalysisInscriptionPresenter } from './analysis-inscription.presenter';

@Controller('inscriptions')
export class AnalysisInscriptionRoute {
  public constructor(
    private readonly analysisInscriptionUsecase: AnalysisInscriptionUsecase,
  ) {}

  @Get(':id/analytics')
  async handle(
    @Param('id') id: string,
    @Query() query: AnalysisInscriptionRequest,
  ): Promise<AnalysisInscriptionResponse> {
    const inscriptionId = String(id);
    const response = await this.analysisInscriptionUsecase.execute({
      inscriptionId,
      page: query.page,
      pageSize: query.pageSize,
    });

    return AnalysisInscriptionPresenter.toHttp(response);
  }
}
