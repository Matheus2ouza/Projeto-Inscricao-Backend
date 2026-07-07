import { CategoryExpense, PaymentMethod } from 'generated/prisma';

export type GeneratePdfExpensesParams = {
  eventId: string;
};

export type GeneratePdfExpensesQuery = {
  category?: CategoryExpense[];
  paymentMethod?: PaymentMethod[];
  startCreatedAt?: Date | string;
  endCreatedAt?: Date | string;
};

export type GeneratePdfExpensesResponse = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf';
};
