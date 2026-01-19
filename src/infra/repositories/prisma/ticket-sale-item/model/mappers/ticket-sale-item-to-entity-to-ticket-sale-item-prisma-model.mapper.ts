import Decimal from 'decimal.js';
import { TicketSaleItem } from 'src/domain/entities/ticket-sale-item.entity';
import TicketSaleItemPrismaModel from '../ticket-sale-item.prisma.model';

export class TicketSaleItemToEntityToTicketSaleItemPrismaModelMapper {
  public static map(ticketSaleItem: TicketSaleItem): TicketSaleItemPrismaModel {
    return {
      id: ticketSaleItem.getId(),
      ticketSaleId: ticketSaleItem.getTicketSaleId(),
      ticketId: ticketSaleItem.getTicketId(),
      quantity: ticketSaleItem.getQuantity(),
      unitPrice: new Decimal(ticketSaleItem.getPricePerTicket()),
      totalValue: new Decimal(ticketSaleItem.getTotalValue()),
      createdAt: ticketSaleItem.getCreatedAt(),
      updatedAt: ticketSaleItem.getUpdatedAt(),
    };
  }
}
