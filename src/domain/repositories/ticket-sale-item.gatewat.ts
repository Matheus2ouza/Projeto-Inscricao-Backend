import { TicketSaleItem } from '../entities/ticket-sale-item.entity';

export abstract class TicketSaleItemGateway {
  // CRUD básico
  abstract create(ticketSaleItem: TicketSaleItem): Promise<TicketSaleItem>;

  // Busca e listagens
  abstract findByTicketSaleId(ticketSaleId: string): Promise<TicketSaleItem[]>;

  // Agregações e contagens
  abstract countItemsByTicketSaleId(ticketSaleId: string): Promise<number>;

  // Remoção
  abstract deleteByTicketSaleIds(ticketSaleIds: string[]): Promise<number>;
}
