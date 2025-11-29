import { TicketSaleItem } from 'src/domain/entities/ticket-sale-item.entity';
import TicketSaleItemPrismaModel from '../ticket-sale-item.prisma.model';

export class TicketSaleItemToPrismaModelToTicketSaleItemEntityMapper {
  public static map(
    ticketSaleItem: TicketSaleItemPrismaModel,
  ): TicketSaleItem {
    return TicketSaleItem.with({
      id: ticketSaleItem.id,
      ticketSaleId: ticketSaleItem.ticketSaleId,
      ticketId: ticketSaleItem.ticketId,
      quantity: ticketSaleItem.quantity,
      pricePerTicket: Number(ticketSaleItem.unitPrice),
      totalValue: Number(ticketSaleItem.totalValue),
      createdAt: ticketSaleItem.createdAt,
      updatedAt: ticketSaleItem.updatedAt,
    });
  }
}

