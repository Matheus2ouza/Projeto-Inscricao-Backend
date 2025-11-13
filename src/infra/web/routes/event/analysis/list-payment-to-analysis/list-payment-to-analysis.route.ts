import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ListPaymentToAnalysisUsecase } from 'src/usecases/web/event/analysis/list-payment-to-analysis/list-payment-to-analysis.usecase';
import { ListPaymentToAnalysisResponse } from './list-payment-to-analysis.dto';
import { ListPaymentToAnalysisPresenter } from './list-payment-to-analysis.presenter';

@ApiTags('Events')
@Controller('events')
export class ListPaymentToAnalysisRoute {
  public constructor(
    private readonly ListPaymentToAnalysisUsecase: ListPaymentToAnalysisUsecase,
  ) {}

  @Get(':eventId/analysis/payment')
  @ApiOperation({
    summary: 'Listar pagamentos de um evento para análise',
    description:
      'Retorna todas as inscrições vinculadas a um evento específico, organizadas por conta de usuário. ' +
      'Para cada conta, são exibidos o nome do responsável, telefone, valor total pago e a quantidade de comprovantes de pagamento associados. ' +
      'Este endpoint é utilizado no painel de análise de inscrições do evento para facilitar a verificação e conferência financeira dos participantes.',
  })
  async handle(
    @Param('eventId') eventId: string,
  ): Promise<ListPaymentToAnalysisResponse> {
    const result = await this.ListPaymentToAnalysisUsecase.execute({
      eventId,
    });
    return ListPaymentToAnalysisPresenter.toHttp(result);
  }
}
