import { Controller, Get, Param } from '@nestjs/common';
import {
  PaymentsDetailsInput,
  PaymentsDetailsUsecase,
} from 'src/usecases/web/payments/payments-details/payments-details.usecase';
import type {
  PaymentsDetailsRequest,
  PaymentsDetailsResponse,
} from './payments-details.dto';
import { PaymentsDetailsPresenter } from './payments-details.presenter';

@Controller('payments')
export class PaymentsDetailsRoute {
  constructor(
    private readonly paymentsDetailsUsecase: PaymentsDetailsUsecase,
  ) {}

  @Get(':paymentId/details')
  async handle(
    @Param() param: PaymentsDetailsRequest,
  ): Promise<PaymentsDetailsResponse> {
    const input: PaymentsDetailsInput = {
      paymentId: param.paymentId,
    };

    const response = await this.paymentsDetailsUsecase.execute(input);
    return PaymentsDetailsPresenter.toHttp(response);
  }
}
