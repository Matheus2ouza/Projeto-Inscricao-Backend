import { SaleTicketOutput } from 'src/usecases/web/tickets/sale/sale-ticket.usecase';
import { SaleTicketResponse } from './sale-ticket.dto';

export class SaleTicketPresenter {
  public static toHttp(output: SaleTicketOutput): SaleTicketResponse {
    return {
      id: output.saleId,
      ticketQuantity: output.totalUnits,
      ticketPdfBase64: output.pdfBase64,
    };
  }
}
