import { CategoryExpense, PaymentMethod } from 'generated/prisma';

export type UpdateExpenseParams = {
  id: string;
};

export type UpdateExpenseBody = {
  description?: string;
  value?: number;
  paymentMethod?: PaymentMethod;
  responsible?: string;
  category?: CategoryExpense;
  createdAt?: Date;
};

export type UpdateExpenseResponse = {
  id: string;
  updated: boolean;
};
