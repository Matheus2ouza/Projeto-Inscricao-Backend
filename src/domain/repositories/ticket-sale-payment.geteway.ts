import { TicketSalePayment } from '../entities/ticket-sale-payment.entity';

export abstract class TicketSalePaymentGateway {
  // CRUD básico
  abstract create(
    ticketSalePayment: TicketSalePayment,
  ): Promise<TicketSalePayment>;

  // Atualizações
  abstract update(
    ticketSalePayment: TicketSalePayment,
  ): Promise<TicketSalePayment>;

  // Buscas e listagens
  abstract findById(id: string): Promise<TicketSalePayment | null>;
  abstract findByTicketSaleId(
    ticketSaleId: string,
  ): Promise<TicketSalePayment[]>;
}
