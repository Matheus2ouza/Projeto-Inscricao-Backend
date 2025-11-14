import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { StatusPayment } from 'generated/prisma';
import {
  ApprovePaymentInput,
  ApprovePaymentUsecase,
} from 'src/usecases/web/paymentInscription/analysis/update-status-payment/approve-payment.usecase';
import {
  RejectPaymentInput,
  RejectPaymentUsecase,
} from 'src/usecases/web/paymentInscription/analysis/update-status-payment/reject-payment.usecase';
import {
  RevertApprovedPaymentInput,
  RevertApprovedPaymentUsecase,
} from 'src/usecases/web/paymentInscription/analysis/update-status-payment/revert-approved-inscription.usecase';
import type {
  UpdatePaymentRequest,
  UpdatePaymentResponse,
} from './update-payment.dto';
import { ApprovePaymentPresenter } from './update-payment.presenter';

@Controller('payments')
export class UpdatePaymentRoute {
  public constructor(
    private readonly approvePaymentUsecase: ApprovePaymentUsecase,
    private readonly rejectPaymentUsecase: RejectPaymentUsecase,
    private readonly revertApprovedPaymentUsecase: RevertApprovedPaymentUsecase,
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
    const { statusPayment, rejectionReason } = body;

    switch (statusPayment) {
      case StatusPayment.APPROVED: {
        const input: ApprovePaymentInput = {
          paymentId: id,
          rejectionReason,
        };
        const response = await this.approvePaymentUsecase.execute(input);
        return ApprovePaymentPresenter.toHttp(response);
      }
      case StatusPayment.REFUSED: {
        if (!rejectionReason) {
          throw new BadRequestException(
            'rejectionReason é obrigatório quando o status for REFUSED',
          );
        }

        const input: RejectPaymentInput = {
          paymentId: id,
          rejectionReason,
        };
        const response = await this.rejectPaymentUsecase.execute(input);
        return ApprovePaymentPresenter.toHttp(response);
      }
      case StatusPayment.UNDER_REVIEW: {
        const input: RevertApprovedPaymentInput = {
          paymentId: id,
        };
        const response = await this.revertApprovedPaymentUsecase.execute(input);
        return ApprovePaymentPresenter.toHttp(response);
      }
      default:
        throw new BadRequestException(
          `Status ${statusPayment} não suportado para atualização`,
        );
    }
  }
}
