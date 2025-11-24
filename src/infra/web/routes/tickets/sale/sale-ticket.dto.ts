import type { StatusPayment } from 'generated/prisma';

export type SaleTicketRequest = {
  ticketId: string;
  accountId: string;
  quantity: number;
  pricePerTicket: number;
  status: StatusPayment;
};

export type SaleTicketResponse = {
  id: string;
  ticketQuantity: number;
  ticketPdfBase64: string;
};
