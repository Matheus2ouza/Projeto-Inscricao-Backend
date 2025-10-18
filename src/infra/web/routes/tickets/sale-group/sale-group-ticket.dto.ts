import type { PaymentMethod, StatusPayment } from 'generated/prisma';

export type SaleGroupTicketRequest = {
  ticketId: string;
  accountId: string;
  quantity: number;
  paymentMethod: PaymentMethod;
  pricePerTicket: number;
  status: StatusPayment;
};

export type SaleGroupTicketResponse = {
  id: string;
};
