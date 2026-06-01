import { PaymentMethod } from 'generated/prisma';

export type SaleTicketParams = {
  eventId: string;
};

export type SaleTicketBody = {
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
  saleId: string;
  totalUnits: number;
  eventName: string;
  buyerName: string;
  saleDate: string;
  totalValue: number;
  barcodes: string[];
};
