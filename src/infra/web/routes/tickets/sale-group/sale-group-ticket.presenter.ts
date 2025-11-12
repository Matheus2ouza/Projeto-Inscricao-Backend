import { SaleGroupTicketOutput } from 'src/usecases/web/tickets/sale-group/sale-group-ticket.usecase';
import { SaleGroupTicketResponse } from './sale-group-ticket.dto';

export class SaleGroupTicketPresenter {
  public static toHttp(output: SaleGroupTicketOutput): SaleGroupTicketResponse {
    return {
      id: output.id,
    };
  }
}
