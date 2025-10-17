import { FindAllTicketOutput } from 'src/usecases/tickets/findAll/find-all-ticket.usecase';
import { FindAllTicketResponse } from './find-all-ticket.dto';

export class FindAllTicketsPresenter {
  public static toHttp(input: FindAllTicketOutput): FindAllTicketResponse {
    return input.map((ticket) => ({
      id: ticket.id,
      eventId: ticket.eventId,
      name: ticket.name,
      description: ticket.description,
      quantity: ticket.quantity,
      price: ticket.price,
      available: ticket.available,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    }));
  }
}
