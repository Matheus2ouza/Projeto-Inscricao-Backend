import type { PaymentMethod } from 'generated/prisma';

export type FindAllPaginatedEventExpensesRequest = {
  page?: string;
  pageSize?: string;
};

export type FindAllPaginatedEventExpensesResponse = {
  expenses: {
    id: string;
    eventId: string;
    description: string;
    value: number;
    paymentMethod: PaymentMethod;
    responsible: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  total: number;
  page: number;
  pageCount: number;
};
