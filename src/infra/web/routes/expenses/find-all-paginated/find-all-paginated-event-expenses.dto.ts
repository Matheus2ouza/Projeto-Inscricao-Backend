import type { PaymentMethod } from 'generated/prisma';

export type FindAllPaginatedEventExpensesParams = {
  eventId: string;
};

export type FindAllPaginatedEventExpensesQuery = {
  page: number;
  pageSize: number;
};

export type FindAllPaginatedEventExpensesResponse = {
  expenses: Expense[];
  total: number;
  page: number;
  pageCount: number;
};

export type Expense = {
  id: string;
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  createdAt: Date;
};
