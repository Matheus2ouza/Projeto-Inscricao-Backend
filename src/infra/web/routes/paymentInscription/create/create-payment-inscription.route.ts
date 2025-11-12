import { Body, Controller, Post } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import {
  CreatePaymentInput,
  CreatePaymentInscriptionUsecase,
} from 'src/usecases/web/paymentInscription/create/create-payment-inscription.usecase';
import type {
  CreatePaymentInscriptionRequest,
  CreatePaymentInscriptionResponse,
} from './create-payment-inscription.dto';
import { CreatePaymentInscriptionPresenter } from './create-payment-inscription.presenter';

@Controller('payments')
export class CreatePaymentInscriptionRoute {
  public constructor(
    private readonly createPaymentInscription: CreatePaymentInscriptionUsecase,
  ) {}

  @Post('create')
  async handle(
    @Body() request: CreatePaymentInscriptionRequest,
    @UserId() id: string,
  ): Promise<CreatePaymentInscriptionResponse> {
    const input: CreatePaymentInput = {
      inscriptionId: request.inscriptionId,
      accountId: id,
      value: request.value,
      image: request.image,
    };

    const response = await this.createPaymentInscription.execute(input);
    const result = CreatePaymentInscriptionPresenter.toHtpp(response);
    return result;
  }
}
