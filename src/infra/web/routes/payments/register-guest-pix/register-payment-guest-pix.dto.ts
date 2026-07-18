import { StatusPayment } from 'generated/prisma';

export type RegisterPaymentGuestPixBody = {
  inscriptionId: string;
  name: string;
  email: string;
  value: string;
  date: string;
};

export type RegisterPaymentGuestPixResponse = {
  id: string;
  status: StatusPayment;
  confirmationCode?: string;
};
