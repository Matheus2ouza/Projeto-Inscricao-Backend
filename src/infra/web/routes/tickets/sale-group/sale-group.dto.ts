import { PaymentMethod } from 'generated/prisma';

export type SaleGrupRequest = {
  eventId: string;
  name: string;

  items: TicketSaleItemInput[];
  payments: TicketSalePaymentInput[];
};

export type TicketSaleItemInput = {
  ticketId: string;
  quantity: number;
};

export type TicketSalePaymentInput = {
  paymentMethod: PaymentMethod;
  value: number;
};

export type TicketSalePaymentResponse = {
  saleId: string;
  totalUnits: number;
};
