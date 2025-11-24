import { TicketSale } from '../entities/ticket-sale.entity';

export abstract class TicketSaleGateway {
  abstract create(ticketSale: TicketSale): Promise<TicketSale>;
  abstract findByEventTicketId(ticketId: string): Promise<TicketSale[]>;
  abstract findByEventId(eventId: string): Promise<TicketSale[]>;

  abstract getEventSalesSummary(eventId: string): Promise<{
    quantityTicketSale: number;
    totalSalesValue: number;
  }>;
}
