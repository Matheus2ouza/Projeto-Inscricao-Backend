import { PaymentMethod } from 'generated/prisma';

export type SaleTicketRequest = {
  name: string;
  items: {
    ticketId: string;
    quantity: number;
  }[];
  payments: {
    paymentMethod: PaymentMethod;
    value: number;
  }[];
};

export type SaleTicketResponse = {
  id: string;
  ticketQuantity: number;
  ticketPdfBase64: string;
};
