import type { CategoryExpense, PaymentMethod } from 'generated/prisma';

export type CreateExpensesRequest = {
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  category: CategoryExpense;
  image: string;
};

export type CreateExpensesResponse = {
  id: string;
};
