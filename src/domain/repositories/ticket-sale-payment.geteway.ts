import { PaymentMethod } from 'generated/prisma';
import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { TicketSalePayment } from '../entities/ticket-sale-payment.entity';

export type TicketSalePaymentSummary = {
  paymentMethod: PaymentMethod;
  totalValue: number;
  count: number;
};

export abstract class TicketSalePaymentGateway {
  // CRUD básico
  abstract create(
    ticketSalePayment: TicketSalePayment,
  ): Promise<TicketSalePayment>;

  abstract createTx(
    ticketSalePayment: TicketSalePayment,
    tx: PrismaTransactionClient,
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

  // Remoções
  abstract deleteByTicketSaleIds(ticketSaleIds: string[]): Promise<number>;

  abstract sumByEventId(eventId: string): Promise<TicketSalePaymentSummary[]>;
}
