import { CashEntryType, PaymentMethod } from 'generated/prisma';

export type CreateNewRegisterParam = {
  cashRegisterId: string;
};

export type CreateNewRegisterBody = {
  type: CashEntryType;
  method: PaymentMethod;
  value: number;
  description?: string;
  eventId: string;
  responsible: string;
  image?: string;
};

export type CreateNewRegisterResponse = {
  id: string;
};
