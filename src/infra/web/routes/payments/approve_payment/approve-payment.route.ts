import { Controller, Param, Post } from '@nestjs/common';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  ApprovePaymentInput,
  ApprovePaymentUsecase,
} from 'src/usecases/web/payments/approve-payment/approve-payment.usecase';
import type {
  ApprovePaymentRequest,
  ApprovePaymentResponse,
} from './approve-payment.dto';
import { ApprovePaymentPresenter } from './approve-payment.presenter';

@Controller('payments')
export class ApprovePaymentRoute {
  constructor(private readonly approvePaymentUsecase: ApprovePaymentUsecase) {}

  @Post(':paymentId/analysis/approve')
  async handle(
    @Param() param: ApprovePaymentRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<ApprovePaymentResponse> {
    const input: ApprovePaymentInput = {
      paymentId: param.paymentId,
      accountId: userInfo.userId,
    };

    const response = await this.approvePaymentUsecase.execute(input);
    return ApprovePaymentPresenter.toHttp(response);
  }
}
