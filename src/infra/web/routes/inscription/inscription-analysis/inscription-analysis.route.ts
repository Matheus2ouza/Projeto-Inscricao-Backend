import { Controller, Get, Param } from '@nestjs/common';
import { InscriptionAnalysisUsecase } from 'src/usecases/inscription/inscription-analysis/inscription-analysis.usecase';
import { InscriptionAnalysisResponse } from './inscription-analysis.dto';
import { InscriptionAnalysisPresenter } from './inscription-analysis.presenter';

@Controller('inscriptions')
export class InscriptionAnalysisRoute {
  public constructor(
    private readonly inscriptionAnalysisUsecase: InscriptionAnalysisUsecase,
  ) {}

  @Get(':eventId/analysis')
  public async handle(
    @Param() eventId: string,
  ): Promise<InscriptionAnalysisResponse> {
    const result = await this.inscriptionAnalysisUsecase.execute({ eventId });

    const response = InscriptionAnalysisPresenter.toHttp(result);
    return response;
  }
}
