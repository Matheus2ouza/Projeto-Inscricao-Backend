import { PaymentMethod } from 'generated/prisma';

export type FindTicketDetailsRequest = {
  eventTicketId: string;
};

export type FindTicketDetailsResponse = {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  available: number;
  expirationDate: Date;
  isActive: boolean;
  TicketSaleItens: TicketSaleItem[];
  ticketSalePayments: TicketSalePayment[];
};

type TicketSalePayment = {
  id: string;
  paymentMethod: PaymentMethod;
  value: number;
  createdAt: Date;
};

export type TicketSaleItem = {
  id: string;
  quantity: number;
  createdAt: Date;
};
