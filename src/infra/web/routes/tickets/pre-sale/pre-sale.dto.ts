import { TicketSaleStatus } from 'generated/prisma';

export type PreSaleRequest = {
  name: string;
  email: string;
  phone?: string;
  totalValue: number;
  image: string;
  tickets: Tickets[];
};

type Tickets = {
  ticketId: string;
  quantity: number;
};

export type PreSaleResponse = {
  id: string;
  status: TicketSaleStatus;
};
