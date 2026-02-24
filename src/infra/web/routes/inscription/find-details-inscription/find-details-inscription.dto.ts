import { genderType } from 'generated/prisma';

export type FindDetailsInscriptionRequest = {
  id: string;
};

export type FindDetailsInscriptionResponse = {
  inscription: Inscription;
  participants: Participant[];
  payments: Payment[];
  paymentLink?: PaymentLink;
};

type Inscription = {
  id: string;
  responsible: string;
  email?: string;
  phone?: string;
  status: string;
  totalValue: number;
  totalPaid: number;
  totalDebt: number;
  createdAt: Date;
  expiresAt?: Date;
};

type Participant = {
  id: string;
  typeInscription?: string;
  name?: string;
  birthDate?: Date;
  gender?: genderType;
};

type Payment = {
  id: string;
  paymentId: string;
  value: number;
  createdAt: Date;
};

type PaymentLink = {
  id: string;
  url: string;
  active: boolean;
};
