import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import TicketSalePrismaModal from '../ticket-sale.prisma.model';

export class TicketSaleToPrismaModelToTicketSaleEntityMapper {
  public static map(ticketSale: TicketSalePrismaModal): TicketSale {
    return TicketSale.with({
      id: ticketSale.id,
      ticketId: ticketSale.ticketId,
      accountId: ticketSale.accountId,
      quantity: ticketSale.quantity,
      paymentMethod: ticketSale.paymentMethod,
      totalValue: Number(ticketSale.totalValue),
      createdAt: ticketSale.createdAt,
      updatedAt: ticketSale.updatedAt,
    });
  }
}
