import { CategoryExpense, PaymentMethod } from 'generated/prisma';

export type FindDetailsExpenseParms = {
  id: string;
};

export type FindDetailsExpenseResponse = {
  id: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  category: CategoryExpense;
  images: string[];
  createdAt: Date;
};
