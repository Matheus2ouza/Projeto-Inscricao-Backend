import { FindTicketsForSaleOutput } from 'src/usecases/web/tickets/find-tickets-for-sale/find-tickets-for-sale.usecase';
import { FindTicketsForSaleResponse } from './find-tickets-for-sale.dto';

export class FindTicketsForSalePresenter {
  public static toHttp(
    output: FindTicketsForSaleOutput,
  ): FindTicketsForSaleResponse {
    return {
      id: output.id,
      name: output.name,
      imageUrl: output.imageUrl,
      ticketEnabled: output.ticketEnabled,
      tickets: output.tickets,
    };
  }
}
