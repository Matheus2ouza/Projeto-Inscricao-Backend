import { statusEvent } from 'generated/prisma';

export type FindAllWithPaymentsRequest = {
  regionId?: string;
  page: number;
  pageSize: number;
};

export type FindAllWithPaymentsResponse = {
  events: Events;
  total: number;
  page: number;
  pageCount: number;
};

type Events = {
  id: string;
  name: string;
  imageUrl: string;
  status: statusEvent;
  totalPayments: number;
  totalDebt: number;
}[];
