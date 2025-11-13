import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  AnalysisPaymentInput,
  AnalysisPaymentUsecase,
} from 'src/usecases/web/paymentInscription/analysis/analysis-payment/analysis-payment.usecase';
import type {
  AnalysisPaymentRequest,
  AnalysisPaymentResponse,
} from './analysis-payment.dto';
import { AnalysisPaymentPresenter } from './analysis-payment.presenter';

@Controller('payments')
export class AnalysisPaymentRoute {
  public constructor(
    private readonly analysisPaymentUsecase: AnalysisPaymentUsecase,
  ) {}

  @Get(':id/analysis')
  @ApiOperation({
    summary: 'Retorna dados analíticos e pagamentos',
    description:
      'Endpoint administrativo que retorna os detalhes de uma inscrição com foco na analise de um pagamento ',
  })
  async handle(
    @Param('id') inscriptionId: string,
    @Query() query: AnalysisPaymentRequest,
  ): Promise<AnalysisPaymentResponse> {
    const page = Number(query.page ?? '1');
    const pageSize = Number(query.pageSize ?? '10');
    const status = Array.isArray(query.status)
      ? query.status
      : query.status
        ? [query.status]
        : [];
    const input: AnalysisPaymentInput = {
      page,
      pageSize,
      status,
      inscriptionId,
    };
    const response = await this.analysisPaymentUsecase.execute(input);
    return AnalysisPaymentPresenter.toHttp(response);
  }
}
