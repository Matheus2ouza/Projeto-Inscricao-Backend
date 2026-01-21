import { Controller, Get, Param } from '@nestjs/common';
import {
  AnalysisPaymentsPendingDetailsInput,
  AnalysisPaymentsPendingDetailsUsecase,
} from 'src/usecases/web/payments/analysis-payments-pending-details/analysis-payments-pending-details.usecase';
import type {
  AnalysisPaymentsPendingDetailsRequest,
  AnalysisPaymentsPendingDetailsResponse,
} from './analysis-payments-pending-details.dto';
import { AnalysisPaymentsPendingDetailsPresenter } from './analysis-payments-pending-details.presenter';

@Controller('payments')
export class AnalysisPaymentsPendingDetailsRoute {
  constructor(
    private readonly analysisPaymentsPendingDetailsUsecase: AnalysisPaymentsPendingDetailsUsecase,
  ) {}

  @Get(':paymentId/analysis-pending/details')
  async handle(
    @Param() param: AnalysisPaymentsPendingDetailsRequest,
  ): Promise<AnalysisPaymentsPendingDetailsResponse> {
    const input: AnalysisPaymentsPendingDetailsInput = {
      paymentId: param.paymentId,
    };

    const response =
      await this.analysisPaymentsPendingDetailsUsecase.execute(input);
    return AnalysisPaymentsPendingDetailsPresenter.toHttp(response);
  }
}
