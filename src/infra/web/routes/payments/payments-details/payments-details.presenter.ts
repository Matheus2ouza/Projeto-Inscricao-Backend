import { PaymentsDetailsOutput } from 'src/usecases/web/payments/payments-details/payments-details.usecase';
import { PaymentsDetailsResponse } from './payments-details.dto';

export class PaymentsDetailsPresenter {
  public static toHttp(output: PaymentsDetailsOutput): PaymentsDetailsResponse {
    return {
      id: output.id,
      status: output.status,
      isGuest: output.isGuest,
      responsible: output.responsible,
      methodPayment: output.methodPayment,
      totalValue: output.totalValue,
      createdAt: output.createdAt,
      updatedAt: output.updatedAt,
      imageUrl: output.imageUrl,
      rejectionReason: output.rejectionReason,
      allocations: output.allocations,
      installments: output.installments,
    };
  }
}
