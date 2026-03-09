import { FindDetailsMovimentOutput } from 'src/usecases/web/cash-register/find-details-moviment/find-details-moviment.usecase';
import { FindDetailsMovimentResponse } from './find-details-moviment.dto';

export class FindDetailsMovimentPresenter {
  public static toHttp(
    output: FindDetailsMovimentOutput,
  ): FindDetailsMovimentResponse {
    return {
      id: output.id,
      type: output.type,
      origin: output.origin,
      method: output.method,
      value: output.value,
      description: output.description,
      eventId: output.eventId,
      paymentInstallmentId: output.paymentInstallmentId,
      onSiteRegistrationId: output.onSiteRegistrationId,
      eventExpenseId: output.eventExpenseId,
      ticketSaleId: output.ticketSaleId,
      responsible: output.responsible,
      imageUrl: output.imageUrl,
      createdAt: output.createdAt,
      reference: output.reference,
    };
  }
}
