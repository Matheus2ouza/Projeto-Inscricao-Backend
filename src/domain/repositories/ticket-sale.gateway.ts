import { TicketSale } from '../entities/ticket-sale.entity';

export abstract class TicketSaleGateway {
  abstract create(ticketSale: TicketSale): Promise<TicketSale | null>;
}
