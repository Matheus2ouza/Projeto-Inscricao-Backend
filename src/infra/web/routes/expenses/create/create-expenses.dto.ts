import type { CategoryExpense, PaymentMethod } from 'generated/prisma';

export type CreateExpensesBody = {
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  category: CategoryExpense;
  image: string;
  createAt?: Date;
};

export type CreateExpensesResponse = {
  id: string;
};
