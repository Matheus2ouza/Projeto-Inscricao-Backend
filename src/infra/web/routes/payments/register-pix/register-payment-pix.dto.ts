import { StatusPayment } from 'generated/prisma';

export type RegisterPaymentPixParam = {
  eventId: string;
};

export type RegisterPaymentPixRequest = {
  eventId: string;
  accountId: string;
  name: string;
  email: string;
  value: string;
  date: string;
  file: File;
  inscriptions: string;
};

export type Inscription = {
  id: string;
};

export type File = {
  buffer: Buffer;
  mimeType: string;
};

export type RegisterPaymentPixResponse = {
  id: string;
  status: StatusPayment;
  confirmationCode?: string;
};
