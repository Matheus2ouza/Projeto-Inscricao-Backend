import { UpdatePaymentReceiptOutput } from 'src/usecases/web/payments/update-payment-receipt/update-payment-receipt.usecase';
import { UpdatePaymentReceiptResponse } from './update-payment-receipt.dto';

export class UpdatePaymentReceipitPresenter {
  public static toHttp(
    output: UpdatePaymentReceiptOutput,
  ): UpdatePaymentReceiptResponse {
    return {
      paymentId: output.paymentId,
      imageUrl: output.imageUrl,
    };
  }
}
