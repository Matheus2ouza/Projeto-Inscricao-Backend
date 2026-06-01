import { SaleTicketOutput } from 'src/usecases/web/tickets/sale/sale-ticket.usecase';
import { SaleTicketResponse } from './sale-ticket.dto';

export class SaleTicketPresenter {
  public static toHttp(output: SaleTicketOutput): SaleTicketResponse {
    return {
      saleId: output.saleId,
      totalUnits: output.totalUnits,
      eventName: output.eventName,
      buyerName: output.buyerName,
      saleDate: output.saleDate,
      totalValue: output.totalValue,
      barcodes: output.barcodes,
    };
  }
}
