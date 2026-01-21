import { Controller, Param, Post } from '@nestjs/common';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  ReversePaymentInput,
  ReversePaymentUsecase,
} from 'src/usecases/web/payments/reverse-payment/reverse-payment.usecase';
import type {
  ReversePaymentRequest,
  ReversePaymentResponse,
} from './reverse-payment.dto';
import { ReversePaymentPresenter } from './reverse-payment.presenter';

@Controller('payments')
export class ReversePaymentRoute {
  constructor(private readonly reversePaymentUsecase: ReversePaymentUsecase) {}

  @Post(':paymentId/analysis/reverse')
  async handle(
    @Param() param: ReversePaymentRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<ReversePaymentResponse> {
    const input: ReversePaymentInput = {
      paymentId: param.paymentId,
      accountId: userInfo.userId,
    };

    const response = await this.reversePaymentUsecase.execute(input);
    return ReversePaymentPresenter.toHttp(response);
  }
}
