import { UpdateTicketsSaleOutput } from 'src/usecases/web/event/update-tickets-sale/update-tickets-sale.usecase';
import { UpdateTicketsSaleResponse } from './update-tickets-sale.dto';

export class UpdateTicketsSalePresenter {
  public static toHttp(
    output: UpdateTicketsSaleOutput,
  ): UpdateTicketsSaleResponse {
    return {
      id: output.id,
      ticketEnabled: output.ticketEnabled,
    };
  }
}
