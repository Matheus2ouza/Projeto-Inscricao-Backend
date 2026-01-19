import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  RegisterPaymentInput,
  RegisterPaymentUsecase,
} from 'src/usecases/web/payments/register/register-payment.usecase';
import type {
  RegisterPaymentRequest,
  RegisterPaymentResponse,
} from './register-payment.dto';
import { RegisterPaymentPresenter } from './register-payment.presenter';

@Controller('payments')
export class RegisterPaymentRoute {
  constructor(
    private readonly registerPaymentUsecase: RegisterPaymentUsecase,
  ) {}

  @Post('register')
  async handle(
    @Body() request: RegisterPaymentRequest,
    @UserId() userId: string,
  ): Promise<RegisterPaymentResponse> {
    const input: RegisterPaymentInput = {
      eventId: request.eventId,
      accountId: userId,
      totalValue: request.totalValue,
      image: request.image,
      inscriptions: request.inscriptions,
    };

    const response = await this.registerPaymentUsecase.execute(input);
    return RegisterPaymentPresenter.toHttp(response);
  }
}
