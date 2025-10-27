import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListInscriptionToAnalysisUsecase } from 'src/usecases/event/analysis/list-inscription-to-analysis/list-Inscription-to-analysis.usecase';
import type { ListInscriptonToAnalysisResponse } from './list-inscription-to-analysis.dto';
import { ListInscriptonToAnalysisPresenter } from './list-inscription-to-analysis.presenter';

@ApiTags('Events')
@Controller('events')
export class ListInscriptonToAnalysisRoute {
  public constructor(
    private readonly listInscriptionToAnalysisUsecase: ListInscriptionToAnalysisUsecase,
  ) {}

  @Get(':eventId/analysis')
  @ApiOperation({
    summary: 'Lista inscrições de um evento para análise',
    description:
      'Retorna todas as inscrições associadas a um evento específico, agrupadas por conta de usuário. ' +
      'Cada conta inclui as informações de responsável, telefone, valor total e status da inscrição. ' +
      'Esse endpoint é usado no painel de análise de inscrições do evento.',
  })
  public async handle(
    @Param('eventId') eventId: string,
  ): Promise<ListInscriptonToAnalysisResponse> {
    const result = await this.listInscriptionToAnalysisUsecase.execute({
      eventId,
    });
    return ListInscriptonToAnalysisPresenter.toHttp(result);
  }
}
