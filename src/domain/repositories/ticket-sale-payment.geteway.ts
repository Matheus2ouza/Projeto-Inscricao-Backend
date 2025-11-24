import { TicketSalePayment } from '../entities/ticket-sale-payment.entity';

export abstract class TicketSalePaymentGateway {
  abstract create(
    ticketSalePayment: TicketSalePayment,
  ): Promise<TicketSalePayment>;
}
