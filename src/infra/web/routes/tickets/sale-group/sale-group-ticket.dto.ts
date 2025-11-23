import type { StatusPayment } from 'generated/prisma';

export type SaleGroupTicketRequest = {
  ticketId: string;
  accountId: string;
  quantity: number;
  pricePerTicket: number;
  status: StatusPayment;
};

export type SaleGroupTicketResponse = {
  id: string;
};
