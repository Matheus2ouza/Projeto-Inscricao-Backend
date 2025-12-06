import Decimal from 'decimal.js';
import { TicketSalePayment } from 'src/domain/entities/ticket-sale-payment.entity';
import TicketSalePaymentPrismaModal from '../ticket-sale-payment.prisma.model';

export class TicketSalePaymentToEntityToTicketSalePaymentPrismaModelMapper {
  public static map(
    ticketSalePayment: TicketSalePayment,
  ): TicketSalePaymentPrismaModal {
    return {
      id: ticketSalePayment.getId(),
      ticketSaleId: ticketSalePayment.getTicketSaleId(),
      paymentMethod: ticketSalePayment.getPaymentMethod(),
      value: Decimal(ticketSalePayment.getValue()),
      imageUrl: ticketSalePayment.getImageUrl() || null,
      financialMovementId: ticketSalePayment.getFinancialMovementId() || null,
      createdAt: ticketSalePayment.getCreatedAt(),
    };
  }
}
