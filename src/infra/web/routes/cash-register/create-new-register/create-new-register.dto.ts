import { CashEntryType, PaymentMethod } from 'generated/prisma';

export type CreateNewRegisterParam = {
  cashRegisterId: string;
};

export type CreateNewRegisterBody = {
  type: CashEntryType;
  method: PaymentMethod;
  favorite?: boolean;
  value: number;
  description: string;
  eventId: string;
  responsible: string;
  images: string[];
  createAt?: Date;
};

export type CreateNewRegisterResponse = {
  id: string;
};
