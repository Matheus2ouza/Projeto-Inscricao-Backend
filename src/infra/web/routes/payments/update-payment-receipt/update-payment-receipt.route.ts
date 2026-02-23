import { Body, Controller, Param, Patch } from '@nestjs/common';
import {
  UpdatePaymentReceiptInput,
  UpdatePaymentReceiptUsecase,
} from 'src/usecases/web/payments/update-payment-receipt/update-payment-receipt.usecase';
import type {
  UpdatePaymentReceiptResponse,
  UpdatePaymentReceiptResquest,
} from './update-payment-receipt.dto';
import { UpdatePaymentReceipitPresenter } from './update-payment-receipt.presenter';

@Controller('payments')
export class UpdatePaymentReceiptRoute {
  constructor(
    private readonly updatePaymentReceiptUsecase: UpdatePaymentReceiptUsecase,
  ) {}

  @Patch(':paymentId/receipt')
  async handle(
    @Param() param: UpdatePaymentReceiptResquest,
    @Body() body: UpdatePaymentReceiptResquest,
  ): Promise<UpdatePaymentReceiptResponse> {
    const input: UpdatePaymentReceiptInput = {
      paymentId: param.paymentId,
      isGuest: body.isGuest,
      image: body.image,
    };

    const response = await this.updatePaymentReceiptUsecase.execute(input);
    return UpdatePaymentReceipitPresenter.toHttp(response);
  }
}
