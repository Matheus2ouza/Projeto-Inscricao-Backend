import Decimal from 'decimal.js';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import TicketSalePrismaModal from '../ticket-sale.prisma.model';

export class TicketSaleToEntityToTicketSalePrismaModelMapper {
  public static map(ticketSale: TicketSale): TicketSalePrismaModal {
    return {
      id: ticketSale.getId(),
      ticketId: ticketSale.getTicketId(),
      accountId: ticketSale.getAccountId(),
      quantity: ticketSale.getQuantity(),
      paymentMethod: ticketSale.getPaymentMethod(),
      totalValue: new Decimal(ticketSale.getTotalValue()),
      createdAt: ticketSale.getCreatedAt(),
      updatedAt: ticketSale.getUpdateAt(),
    };
  }
}
