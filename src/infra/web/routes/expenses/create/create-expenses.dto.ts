import type { PaymentMethod } from 'generated/prisma';

export type CreateExpensesRequest = {
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
};

export type CreateExpensesResponse = {
  id: string;
};
