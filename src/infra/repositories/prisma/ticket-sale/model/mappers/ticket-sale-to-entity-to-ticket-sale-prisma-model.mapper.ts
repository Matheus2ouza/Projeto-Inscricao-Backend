import Decimal from 'decimal.js';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import TicketSalePrismaModal from '../ticket-sale.prisma.model';

export class TicketSaleToEntityToTicketSalePrismaModelMapper {
  public static map(ticketSale: TicketSale): TicketSalePrismaModal {
    return {
      id: ticketSale.getId(),
      eventId: ticketSale.getEventId(),
      name: ticketSale.getName(),
      email: ticketSale.getEmail(),
      phone: ticketSale.getPhone() || null,
      status: ticketSale.getStatus(),
      totalValue: new Decimal(ticketSale.getTotalValue()),
      approvedBy: ticketSale.getApprovedBy() || null,
      createdAt: ticketSale.getCreatedAt(),
      updatedAt: ticketSale.getUpdateAt(),
    };
  }
}
