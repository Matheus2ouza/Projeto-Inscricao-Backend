import { CreateTicketOutput } from 'src/usecases/tickets/create/create-ticket.usecase';
import { CreateTicketResponse } from './create-ticket.dto';

export class CreateTicketPresenter {
  public static toHttp(input: CreateTicketOutput): CreateTicketResponse {
    const response: CreateTicketResponse = {
      id: input.id,
    };
    return response;
  }
}
