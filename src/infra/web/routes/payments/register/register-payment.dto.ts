import { StatusPayment } from 'generated/prisma';

export type RegisterPaymentRequest = {
  eventId: string;
  accountId: string;
  totalValue: number;
  image: string;
  inscriptions: inscription[];
};

type inscription = {
  id: string;
};

export type RegisterPaymentResponse = {
  id: string;
  totalValue: number;
  status: StatusPayment;
  createdAt: Date;
};
