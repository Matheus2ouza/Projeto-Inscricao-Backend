import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  AnalysisPaymentsPendingInput,
  AnalysisPaymentsPendingUsecase,
} from 'src/usecases/web/payments/analysis-payments-pending/analysis-payments-pending.usecase';
import type {
  AnalysisPaymentsPendingRequest,
  AnalysisPaymentsPendingResponse,
} from './analysis-payments-pending.dto';
import { AnalysisPaymentsPendingPresenter } from './analysis-payments-pending.presenter';

@Controller('payments')
export class AnalysisPaymentsPendingRoute {
  constructor(
    private readonly analysisPaymentsPendingUsecase: AnalysisPaymentsPendingUsecase,
  ) {}

  @Get(':eventId/analysis-pending')
  async handle(
    @Param() param: AnalysisPaymentsPendingRequest,
    @Query() query: AnalysisPaymentsPendingRequest,
  ): Promise<AnalysisPaymentsPendingResponse> {
    const input: AnalysisPaymentsPendingInput = {
      eventId: param.eventId,
      page: query.page,
      pageSize: query.pageSize,
    };

    const response = await this.analysisPaymentsPendingUsecase.execute(input);
    return AnalysisPaymentsPendingPresenter.toHttp(response);
  }
}
