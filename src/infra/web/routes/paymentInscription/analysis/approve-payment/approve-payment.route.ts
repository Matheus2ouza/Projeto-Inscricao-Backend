import { Controller, Param, Patch } from '@nestjs/common';
import { ApprovePaymentUsecase } from 'src/usecases/paymentInscription/analysis/update-status-payment/approve-payment.usecase';
import type {
  ApprovePaymentRequest,
  ApprovePaymentResponse,
} from './approve-payment.dto';
import { ApprovePaymentPresenter } from './approve-payment.presenter';

@Controller('payments')
export class ApprovePaymentRoute {
  public constructor(
    private readonly approvePaymentUsecase: ApprovePaymentUsecase,
  ) {}

  @Patch(':paymentId/aprroved')
  async handle(
    @Param('paymentId') id: ApprovePaymentRequest,
  ): Promise<ApprovePaymentResponse> {
    const paymentId = String(id);
    const response = await this.approvePaymentUsecase.execute({ paymentId });
    return ApprovePaymentPresenter.toHttp(response);
  }
}
