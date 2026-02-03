import { Body, Controller, Param, Post } from '@nestjs/common';
import { IsPublic } from 'src/infra/web/authenticator/decorators/is-public.decorator';
import {
  RegisterPaymentPixInput,
  RegisterPaymentPixUsecase,
} from 'src/usecases/web/payments/register-pix/register-payment-pix.usecase';
import type {
  RegisterPaymentPixRequest,
  RegisterPaymentPixResponse,
} from './register-payment-pix.dto';
import { RegisterPaymentPixPresenter } from './register-payment-pix.presenter';

@Controller('payments')
export class RegisterPaymentPixRoute {
  constructor(
    private readonly registerPaymentUsecase: RegisterPaymentPixUsecase,
  ) {}

  @IsPublic()
  @Post(':eventId/register/pix')
  async handle(
    @Param() param: RegisterPaymentPixRequest,
    @Body() body: RegisterPaymentPixRequest,
  ): Promise<RegisterPaymentPixResponse> {
    const guestDate = {
      guestName: body.guestName,
      guestEmail: body.guestEmail,
    };
    const input: RegisterPaymentPixInput = {
      eventId: param.eventId,
      accountId: body.accountId,
      isGuest: body.isGuest ?? false,
      ...(body.isGuest ? guestDate : {}),
      totalValue: body.totalValue,
      image: body.image,
      inscriptions: body.inscriptions,
    };

    console.log(input);

    const response = await this.registerPaymentUsecase.execute(input);
    return RegisterPaymentPixPresenter.toHttp(response);
  }
}
