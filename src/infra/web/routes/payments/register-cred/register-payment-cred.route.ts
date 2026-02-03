import { Body, Controller, Param, Post } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import type { UserInfoType } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import {
  RegisterPaymentCredInput,
  RegisterPaymentCredUsecase,
} from 'src/usecases/web/payments/register-cred/register-payment-cred.usecase';
import type {
  RegisterPaymentCredRequest,
  RegisterPaymentCredResponse,
} from './register-payment-cred.dto';
import { RegisterPaymentCredPresenter } from './register-payment-cred.presenter';

@Controller('payments')
export class RegisterPaymentCredRoute {
  constructor(
    private readonly registerCredUsecase: RegisterPaymentCredUsecase,
  ) {}

  @IsPublic()
  @Post(':eventId/register/cred')
  async handle(
    @Param() param: RegisterPaymentCredRequest,
    @Body() body: RegisterPaymentCredRequest,
    @UserInfo() userInfo: UserInfoType,
  ): Promise<RegisterPaymentCredResponse> {
    // O accountId vem tando do body ou do userInfo
    // porque no front pode enviar o link para outra pessoa não logada possa também fazer o pagamento
    const input: RegisterPaymentCredInput = {
      eventId: param.eventId,
      accountId: userInfo?.userId || body.accountId,
      guestEmail: body.guestEmail,
      isGuest: body.isGuest,
      totalValue: body.totalValue,
      client: body.client,
      inscriptions: body.inscriptions,
    };

    const response = await this.registerCredUsecase.execute(input);
    return RegisterPaymentCredPresenter.toHttp(response);
  }
}
