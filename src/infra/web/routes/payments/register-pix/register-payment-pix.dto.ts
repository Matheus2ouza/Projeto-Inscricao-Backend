import { StatusPayment } from 'generated/prisma';

export type RegisterPaymentPixRequest = {
  eventId: string;
  accountId?: string;
  guestName?: string;
  guestEmail?: string;
  isGuest: boolean;
  totalValue: number;
  image: string;
  inscriptions: inscription[];
};

type inscription = {
  id: string;
};

export type RegisterPaymentPixResponse = {
  id: string;
  totalValue: number;
  status: StatusPayment;
  createdAt: Date;
};
