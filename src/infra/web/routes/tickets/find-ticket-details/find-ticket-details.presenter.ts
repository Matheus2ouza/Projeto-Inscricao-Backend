import { FindTicketDetailsOutput } from 'src/usecases/web/tickets/find-ticket-details/find-ticket-details.usecase';
import { FindTicketDetailsResponse } from './find-ticket-details.dto';

export class FindTicketDetailsPresenter {
  public static toHttp(
    output: FindTicketDetailsOutput,
  ): FindTicketDetailsResponse {
    const aModal: FindTicketDetailsResponse = {
      id: output.id,
      name: output.name,
      description: output.description,
      quantity: output.quantity,
      price: output.price,
      available: output.available,
      ticketSale: output.ticketSale,
      expirationDate: output.expirationDate,
      isActive: output.isActive,
    };
    return aModal;
  }
}
