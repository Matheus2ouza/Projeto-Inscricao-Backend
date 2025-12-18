import { PaymentMethod, TicketSaleStatus } from 'generated/prisma';

export type AnalysisPreSaleRequest = {
  eventId: string;
  page: number;
  pageSize: number;
};

export type AnalysisPreSaleResponse = {
  event: Event;
  total: number;
  page: number;
  pageCount: number;
};

type Event = {
  id: string;
  name: string;
  imageUrl: string;
  TicketSales?: TicketSale[];
};

type TicketSale = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
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
