import { TicketSaleStatus } from 'generated/prisma';
import { TicketSale } from '../entities/ticket-sale.entity';

export abstract class TicketSaleGateway {
  // CRUD básico
  abstract create(ticketSale: TicketSale): Promise<TicketSale>;

  // Buscas e listagens
  abstract findById(ticketSaleId: string): Promise<TicketSale | null>;
  abstract findByEventId(eventId: string): Promise<TicketSale[]>;
  abstract findByEventIdWithPagination(
    page: number,
    pageSize: number,
    filter?: {
      eventId?: string;
      status?: TicketSaleStatus[];
    },
  ): Promise<TicketSale[]>;

  // Agregações e contagens
  abstract countSalesByEventId(eventId: string): Promise<number>;
  abstract getEventSalesSummary(eventId: string): Promise<{
    quantityTicketSale: number;
    totalSalesValue: number;
  }>;

  // Atualizações de Status
  abstract approvePreSale(
    ticketSaleId: string,
    status: TicketSaleStatus,
    updatedAt: Date,
  ): Promise<TicketSale>;

  abstract approvePreSaleAtomic(
    ticketSaleId: string,
    accountId: string,
    totalValue: number,
  ): Promise<{
    sale: any;
    items: any[];
    ticketUnits: any[];
  }>;

  abstract rejectPreSale(
    ticketSaleId: string,
    status: TicketSaleStatus,
    updatedAt: Date,
  ): Promise<TicketSale>;
}
