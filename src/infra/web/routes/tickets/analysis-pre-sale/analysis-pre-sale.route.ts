import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  AnalysisPreSaleInput,
  AnalysisPreSaleUseCase,
} from 'src/usecases/web/tickets/analysis-pre-sale/analysis-pre-sale.usecase';
import type {
  AnalysisPreSaleRequest,
  AnalysisPreSaleResponse,
} from './analysis-pre-sale.dto';
import { AnalysisPreSalePresenter } from './analysis-pre-sale.presenter';

@Controller('tickets')
export class AnalysisPreSaleRoute {
  constructor(
    private readonly analysisPreSaleUseCase: AnalysisPreSaleUseCase,
  ) {}

  @Get(':eventId/analysis')
  async handle(
    @Param() param: AnalysisPreSaleRequest,
    @Query() query: AnalysisPreSaleRequest,
  ): Promise<AnalysisPreSaleResponse> {
    const input: AnalysisPreSaleInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const resposne = await this.analysisPreSaleUseCase.execute(input);
    return AnalysisPreSalePresenter.toHttp(resposne);
  }
}
