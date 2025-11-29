import { TicketSaleStatus } from 'generated/prisma';

export type RejectPreSaleRequest = {
  ticketSaleId: string;
};

export type RejectPreSaleResponse = {
  ticketSaleId: string;
  status: TicketSaleStatus;
};
