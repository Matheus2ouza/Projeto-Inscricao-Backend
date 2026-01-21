import { Body, Controller, Param, Post } from '@nestjs/common';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  RejectedPaymentInput,
  RejectedPaymentUsecase,
} from 'src/usecases/web/payments/rejected-payment/rejected-payment.usecase';
import type {
  RejectedPaymentRequest,
  RejectedPaymentResponse,
} from './rejected-payment.dto';
import { RejectedPaymentPresenter } from './rejected-payment.presenter';

@Controller('payments')
export class RejectedPaymentRoute {
  constructor(
    private readonly rejectedPaymentUsecase: RejectedPaymentUsecase,
  ) {}

  @Post(':paymentId/analysis/rejected')
  async handle(
    @Param() param: RejectedPaymentRequest,
    @UserInfo() userInfo: UserInfoType,
    @Body() body: RejectedPaymentRequest,
  ): Promise<RejectedPaymentResponse> {
    const input: RejectedPaymentInput = {
      paymentId: param.paymentId,
      accountId: userInfo.userId,
      rejectionReason: body.rejectionReason,
    };

    const response = await this.rejectedPaymentUsecase.execute(input);
    return RejectedPaymentPresenter.toHttp(response);
  }
}
