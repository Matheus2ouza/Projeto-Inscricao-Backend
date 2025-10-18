import { SaleTicketOutput } from 'src/usecases/tickets/sale/sale-ticket.usecase';
import { SaleTicketResponse } from './sale-ticket.dto';

export class SaleTicketPresenter {
  public static toHttp(output: SaleTicketOutput): SaleTicketResponse {
    return {
      id: output.id,
      ticketQuantity: output.ticketQuantity,
      ticketPdfBase64: output.ticketPdfBase64,
    };
  }
}
