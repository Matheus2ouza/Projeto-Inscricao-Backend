import { TicketSalePayment } from 'src/domain/entities/ticket-sale-payment.entity';
import TicketSalePaymentPrismaModal from '../ticket-sale-payment.prisma.model';

export class TicketSalePaymentToPrismaModelToTicketSalePaymentEntityMapper {
  public static map(
    ticketSalePayment: TicketSalePaymentPrismaModal,
  ): TicketSalePayment {
    return TicketSalePayment.with({
      id: ticketSalePayment.id,
      ticketSaleId: ticketSalePayment.ticketSaleId,
      paymentMethod: ticketSalePayment.paymentMethod,
      value: Number(ticketSalePayment.value),
      imageUrl: ticketSalePayment.imageUrl || undefined,
      financialMovementId: ticketSalePayment.financialMovementId || undefined,
      createdAt: ticketSalePayment.createdAt,
    });
  }
}
