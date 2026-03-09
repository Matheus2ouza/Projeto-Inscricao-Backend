import { Body, Controller, Param, Post } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
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
  ): Promise<RegisterPaymentCredResponse> {
    console.log('param', param);
    console.log('body', body);

    const input: RegisterPaymentCredInput = {
      eventId: param.eventId,
      accountId: body.accountId,
      guestEmail: body.guestEmail,
      isGuest: body.isGuest,
      totalValue: body.totalValue,
      client: body.client,
      inscriptions: body.inscriptions,
      passCustomerToAsaas: body.passCustomerToAsaas,
    };

    console.log('input', input);

    const response = await this.registerCredUsecase.execute(input);
    return RegisterPaymentCredPresenter.toHttp(response);
  }
}
