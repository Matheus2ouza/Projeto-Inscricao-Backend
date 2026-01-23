import { Controller, Get, Param, ParseBoolPipe, Query } from '@nestjs/common';
import {
  GeneratePdfFinancialReportInput,
  GeneratePdfFinancialReportUsecase,
} from 'src/usecases/web/report/report-general/pdf-financial/generate-pdf-financial-report.usecase';
import type {
  GeneratePdfFinancialReportRequest,
  GeneratePdfFinancialReportResponse,
} from './generate-pdf-financial-report.dto';
import { GeneratePdfFinancialReportPresenter } from './generate-pdf-financial-report.presenter';

@Controller('report')
export class GeneratePdfFinancialReportRoute {
  constructor(
    private readonly generatePdfFinancialReportUsecase: GeneratePdfFinancialReportUsecase,
  ) {}

  @Get(':eventId/financial/pdf/')
  async handle(
    @Param() param: GeneratePdfFinancialReportRequest,
    @Query('details', ParseBoolPipe) details: boolean,
  ): Promise<GeneratePdfFinancialReportResponse> {
    const input: GeneratePdfFinancialReportInput = {
      eventId: param.eventId,
      details,
    };

    const response =
      await this.generatePdfFinancialReportUsecase.execute(input);
    return GeneratePdfFinancialReportPresenter.toHttp(response);
  }
}
