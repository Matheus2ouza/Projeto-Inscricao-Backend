import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import TicketSalePrismaModal from '../ticket-sale.prisma.model';

export class TicketSaleToPrismaModelToTicketSaleEntityMapper {
  public static map(ticketSale: TicketSalePrismaModal): TicketSale {
    return TicketSale.with({
      id: ticketSale.id,
      ticketId: ticketSale.ticketId,
      accountId: ticketSale.accountId,
      quantity: ticketSale.quantity,
      totalValue: Number(ticketSale.totalValue),
      status: ticketSale.status,
      createdAt: ticketSale.createdAt,
      updatedAt: ticketSale.updatedAt,
    });
  }
}
