import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import TicketSalePrismaModal from '../ticket-sale.prisma.model';

export class TicketSaleToPrismaModelToTicketSaleEntityMapper {
  public static map(ticketSale: TicketSalePrismaModal): TicketSale {
    return TicketSale.with({
      id: ticketSale.id,
      eventId: ticketSale.eventId,
      name: ticketSale.name,
      email: ticketSale.email,
      phone: ticketSale.phone ?? undefined,
      status: ticketSale.status,
      totalValue: Number(ticketSale.totalValue),
      approvedBy: ticketSale.approvedBy ?? undefined,
      createdAt: ticketSale.createdAt,
      updatedAt: ticketSale.updatedAt,
    });
  }
}
