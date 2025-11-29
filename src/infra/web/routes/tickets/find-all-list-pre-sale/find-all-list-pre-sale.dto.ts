import { PaymentMethod, TicketSaleStatus } from 'generated/prisma';

export type FindAllListPreSaleRequest = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type FindAllListPreSaleResponse = {
  event: Event;
  total: number;
  page: number;
  pageCount: number;
};

type Event = {
  id: string;
  name: string;
  imageUrl: string;
  countTicketSales: number;
  countTicketSalesPending: number;
  countTicketSalesPaid: number;
  ticketSales: TicketSales[];
};

type TicketSales = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: TicketSaleStatus;
  totalValue: number;
  payments: TicketSalePayment;
  TicketSaleItem: TicketSaleItem[];
};

type TicketSalePayment = {
  id: string;
  paymentMethod: PaymentMethod;
  value: number;
  imageUrl: string;
  createdAt: Date;
};

type TicketSaleItem = {
  id: string;
  ticketName: string;
  quantity: number;
  pricePerTicket: number;
  totalValue: number;
};
