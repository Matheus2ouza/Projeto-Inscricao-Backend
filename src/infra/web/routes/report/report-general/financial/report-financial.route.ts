import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ReportFinancialInput,
  ReportFinancialUsecase,
} from 'src/usecases/web/report/report-general/financial/report-financial.usecase';
import type {
  ReportFinancialRequest,
  ReportFinancialResponse,
} from './report-financial.dto';
import { ReportFinancialPresenter } from './report-financial.presenter';

@Controller('report')
export class ReportFinancialRoute {
  constructor(
    private readonly reportFinancialUsecase: ReportFinancialUsecase,
  ) {}

  @Get(':eventId/financial') async handle(
    @Param() param: ReportFinancialRequest,
    @Query() query: ReportFinancialRequest,
  ): Promise<ReportFinancialResponse> {
    const input: ReportFinancialInput = {
      eventId: param.eventId,
      details: query.details,
    };

    const response = await this.reportFinancialUsecase.execute(input);
    return ReportFinancialPresenter.toHttp(response);
  }
}
