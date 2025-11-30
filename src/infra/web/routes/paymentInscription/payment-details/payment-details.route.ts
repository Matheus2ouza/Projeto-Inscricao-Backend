import { Controller, Get, Param } from '@nestjs/common';
import {
  PaymentDetailsInput,
  PaymentDetailsUsecase,
} from 'src/usecases/web/paymentInscription/payment-details/payment-details.usecase';
import type {
  PaymentDetailsRequest,
  PaymentDetailsResponse,
} from './payment-details.dto';
import { PaymentDetailsPresenter } from './payment-details.presenter';

@Controller('payments')
export class PaymentDetailsRoute {
  constructor(private readonly paymentDetailsUsecase: PaymentDetailsUsecase) {}

  @Get(':paymentInscriptionId/details')
  async handle(
    @Param() params: PaymentDetailsRequest,
  ): Promise<PaymentDetailsResponse> {
    const input: PaymentDetailsInput = {
      paymentInscriptionId: params.paymentInscriptionId,
    };

    const response = await this.paymentDetailsUsecase.execute(input);
    return PaymentDetailsPresenter.toHttp(response);
  }
}
