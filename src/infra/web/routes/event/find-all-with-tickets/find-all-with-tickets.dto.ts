import { statusEvent } from 'generated/prisma';

export type FindAllWithTicketsRequest = {
  status?: statusEvent[];
  page: number;
  pageSize: number;
};

export type FindAllWithTicketsResponse = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

export type Events = {
  id: string;
  name: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
  ticketEnabled?: boolean;
  countTickets: number;
  countSaleTickets: number;
}[];
