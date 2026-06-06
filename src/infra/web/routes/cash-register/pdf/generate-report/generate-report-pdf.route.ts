import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  GenerateReportPdfInput,
  GenerateReportPdfUsecase,
} from 'src/usecases/web/cash-register/pdf/generate-report/generate-report-pdf.usecase';
import type {
  GenerateReportPdfParams,
  GenerateReportPdfQuery,
  GenerateReportPdfResponse,
} from './generate-report-pdf.dto';
import { GenerateReportPdfPresenter } from './generate-report-pdf.presenter';

@Controller('cash-register')
export class GenerateReportPdfRoute {
  constructor(
    private readonly generateReportPdfUsecase: GenerateReportPdfUsecase,
  ) {}

  @Get(':id/pdf')
  async handle(
    @Param() param: GenerateReportPdfParams,
    @Query() query: GenerateReportPdfQuery,
  ): Promise<GenerateReportPdfResponse> {
    const input: GenerateReportPdfInput = {
      id: param.id,
      listExpenseCategory: query.listExpenseCategory === 'true',
      moviments: query.moviments === 'true',
      favorite: query.favorite === 'true',
    };

    const response = await this.generateReportPdfUsecase.execute(input);
    return GenerateReportPdfPresenter.toHttp(response);
  }
}
