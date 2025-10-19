import type { PaymentMethod } from 'generated/prisma';

export type CreateEventExpensesRequest = {
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
};

export type CreateEventExpensesResponse = {
  id: string;
};
