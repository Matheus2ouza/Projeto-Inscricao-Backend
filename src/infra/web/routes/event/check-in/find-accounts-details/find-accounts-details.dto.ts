import { InscriptionStatus, StatusPayment } from 'generated/prisma';

export type FindAccountsDetailsRequest = {
  eventId: string;
  accountId: string;
};

export type FindAccountsDetailsResponse = {
  id: string;
  username: string;
  status: string;
  countDebt: number;
  countPay: number;
  countInscriptions: number;
  countParticipants: number;
  inscriptions: Inscriptions;
};

type Inscriptions = {
  id: string;
  responsible: string;
  email?: string;
  status: InscriptionStatus;
  totalPayd: number;
  totalDebt: number;
  createdAt: Date;
  participants: Participants;
  paymentInscription: PaymentInscription;
}[];

type Participants = {
  name: string;
  gender: string;
  birthDate: Date;
  typeInscription: string;
}[];

type PaymentInscription = {
  value: number;
  status: StatusPayment;
  image: string;
  createdAt: Date;
}[];
