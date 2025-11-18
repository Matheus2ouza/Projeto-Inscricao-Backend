import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AnalysisInscriptionUsecase } from 'src/usecases/web/inscription/analysis/analysis-inscription/analysis-inscription.usecase';
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
  @ApiOperation({
    summary: 'Retorna dados analíticos e participantes de uma inscrição',
    description:
      'Endpoint administrativo que retorna os detalhes de uma inscrição, incluindo o responsável, status, ' +
      'lista de participantes e informações de paginação. Usado no painel de análise de inscrições do evento.',
  })
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
