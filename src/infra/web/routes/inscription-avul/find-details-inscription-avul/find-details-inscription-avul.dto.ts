import { PaymentMethod } from 'generated/prisma';

export type FindDetailsInscriptionAvulRequest = {
  inscriptionId: string;
};

export type FindDetailsInscriptionAvulResponse = {
  id: string;
  name: string;
  createdAt: Date;
  onSiteParticipant: OnSiteParticipant[];
};

type OnSiteParticipant = {
  id: string;
  name: string;
  gender: string;
  onSiteParticipantPayment: OnSiteParticipantPayment[];
};

type OnSiteParticipantPayment = {
  id: string;
  paymentMethod: PaymentMethod;
  value: number;
};
