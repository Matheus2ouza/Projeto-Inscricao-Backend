import { FindTicketDetailsOutput } from 'src/usecases/tickets/find-ticket-details/find-ticket-details.usecase';
import { FindTicketDetailsResponse } from './find-ticket-details.dto';

export class FindTicketDetailsPresenter {
  public static toHttp(
    input: FindTicketDetailsOutput,
  ): FindTicketDetailsResponse {
    const aModal: FindTicketDetailsResponse = {
      id: input.id,
      name: input.name,
      description: input.description,
      quantity: input.quantity,
      price: input.price,
      available: input.available,
      ticketSale: input.ticketSale,
    };
    return aModal;
  }
}
