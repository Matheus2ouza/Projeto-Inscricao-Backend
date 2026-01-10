import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  CreatePaymentInput,
  CreatePaymentUsecase,
} from 'src/usecases/web/payments/create/create-payment.usecase';
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
} from './create-payment.dto';
import { CreatePaymentPresenter } from './create-payment.presenter';

@Controller('payments')
export class CreatePaymentRoute {
  constructor(private readonly createPaymentUsecase: CreatePaymentUsecase) {}

  @Post('create')
  async handle(
    @Body() request: CreatePaymentRequest,
    @UserId() userId: string,
  ): Promise<CreatePaymentResponse> {
    const input: CreatePaymentInput = {
      eventId: request.eventId,
      accountId: userId,
      totalValue: request.totalValue,
      image: request.image,
      inscriptions: request.inscriptions,
    };

    console.log(input);

    const response = await this.createPaymentUsecase.execute(input);
    return CreatePaymentPresenter.toHttp(response);
  }
}
