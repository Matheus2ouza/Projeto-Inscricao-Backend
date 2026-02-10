import { statusEvent } from 'generated/prisma';

export type FindAllWithPaymentsRequest = {
  regionId?: string;
  status?: statusEvent[];
  paymentEnabled?: string;
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
  startDate?: Date;
  endDate?: Date;
  location?: string;
  paymentEnabled?: boolean;
  totalPayments?: number;
  totalDebt?: number;
  countPaymentsAnalysis?: number;
  amountCollected?: number;
}[];
