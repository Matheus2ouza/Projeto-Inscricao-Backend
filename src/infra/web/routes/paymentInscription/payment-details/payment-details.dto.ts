import { InscriptionStatus, StatusPayment } from 'generated/prisma';

export type PaymentDetailsRequest = {
  paymentInscriptionId: string;
};

export type PaymentDetailsResponse = {
  inscription: Inscription;
};

type Inscription = {
  id: string;
  responsible: string;
  email?: string;
  phone: string;
  status: InscriptionStatus;
  openBalance: number;
  originalValue: number;
  countParticipants: number;
  payments: PaymentSummary[];
};

type PaymentSummary = {
  id: string;
  accountName?: string;
  status: StatusPayment;
  value: number;
  imageUrl: string;
  approvedBy?: string;
  createdAt: Date;
};
