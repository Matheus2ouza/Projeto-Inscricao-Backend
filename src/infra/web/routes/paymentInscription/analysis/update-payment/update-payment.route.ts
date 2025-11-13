import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import {
  UpdatePaymentInput,
  UpdatePaymentUsecase,
} from 'src/usecases/web/paymentInscription/analysis/update-status-payment/update-payment.usecase';
import type {
  UpdatePaymentRequest,
  UpdatePaymentResponse,
} from './update-payment.dto';
import { ApprovePaymentPresenter } from './update-payment.presenter';

@Controller('payments')
export class UpdatePaymentRoute {
  public constructor(
    private readonly updatePaymentUsecase: UpdatePaymentUsecase,
  ) {}

  @Patch(':paymentId/update')
  @ApiOperation({
    summary: 'Atualiza o status de uma pagamento (análise)',
    description:
      'Permite ao administrador alterar o status de uma pagamento específico durante o processo de análise. ' +
      'O ID é passado via parâmetro, o status via body (ex: APPROVED, UNDER_REVIEW, REFUSED) ' +
      'e o motivo da rejeição via body (quando status for REFUSED).',
  })
  async handle(
    @Param('paymentId') id: string,
    @Body() body: UpdatePaymentRequest,
  ): Promise<UpdatePaymentResponse> {
    const paymentId = id;

    const input: UpdatePaymentInput = {
      paymentId,
      statusPayment: body.statusPayment,
      rejectionReason: body.rejectionReason,
    };

    console.log(input);

    const response = await this.updatePaymentUsecase.execute(input);
    return ApprovePaymentPresenter.toHttp(response);
  }
}
