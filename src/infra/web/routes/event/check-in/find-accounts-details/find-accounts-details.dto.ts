import { InscriptionStatus, StatusPayment } from 'generated/prisma';

export type FindAccountsDetailsRequest = {
  eventId: string;
  accountId: string;
};

export type FindAccountsDetailsResponse = {
  id: string;
  username: string;
  email: string;
  status: string;
  countDebt: number;
  countPay: number;
  countInscriptions: number;
  inscriptions: Inscriptions;
};

type Inscriptions = {
  id: string;
  status: InscriptionStatus;
  totalPayd: number;
  totalDebt: number;
  createdAt: Date;
  participants: Participants;
  paymentInscription: PaymentInscriptionOutput[];
}[];

type Participants = {
  name: string;
  gender: string;
  birthDate: Date;
  typeInscription: string;
}[];

type PaymentInscriptionOutput = {
  value: number;
  status: StatusPayment;
  image: string;
  createdAt: Date;
};
