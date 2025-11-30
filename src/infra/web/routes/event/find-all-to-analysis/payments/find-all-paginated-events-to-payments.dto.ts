import { statusEvent } from 'generated/prisma';

export type FindAllPaginatedEventToPaymentRequest = {
  status?: statusEvent[];
  page?: number;
  pageSize?: number;
};

export type FindAllPaginatedEventToPaymentResponse = {
  events: {
    id: string;
    name: string;
    imageUrl?: string;
    countPayments: number;
    countPaymentsAnalysis: number;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
