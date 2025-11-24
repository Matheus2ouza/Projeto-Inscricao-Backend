import { FindAllTicketOutput } from 'src/usecases/web/tickets/findAll/find-all-ticket.usecase';
import { FindAllTicketResponse } from './find-all-ticket.dto';

export class FindAllTicketsPresenter {
  public static toHttp(output: FindAllTicketOutput): FindAllTicketResponse {
    return {
      id: output.id,
      name: output.name,
      imageUrl: output.imageUrl,
      quantityTicketSale: output.quantityTicketSale,
      totalSalesValue: output.totalSalesValue,
      tickets: output.tickets,
    };
  }
}
