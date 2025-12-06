import { SaleGrupOutput } from 'src/usecases/web/tickets/sale-group/sale-group.usecase';
import { TicketSalePaymentResponse } from './sale-group.dto';

export class SaleGrupPresenter {
  public static toHttp(output: SaleGrupOutput): TicketSalePaymentResponse {
    return {
      saleId: output.saleId,
      totalUnits: output.totalUnits,
    };
  }
}
