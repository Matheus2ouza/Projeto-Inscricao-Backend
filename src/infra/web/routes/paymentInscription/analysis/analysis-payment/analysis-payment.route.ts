import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AnalysisPaymentUsecase } from 'src/usecases/web/paymentInscription/analysis/analysis-payment/analysis-payment.usecase';
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

  @Get(':inscriptionId/analysis')
  @ApiOperation({
    summary: 'Retorna dados analíticos e pagamentos',
    description:
      'Endpoint administrativo que retorna os detalhes de uma inscrição com foco na analise de um pagamento ',
  })
  async handle(
    @Param('inscriptionId') id: AnalysisPaymentRequest,
  ): Promise<AnalysisPaymentResponse> {
    const inscriptionId = String(id);
    const response = await this.analysisPaymentUsecase.execute({
      inscriptionId,
    });
    return AnalysisPaymentPresenter.toHttp(response);
  }
}
