import { InscriptionStatus } from 'generated/prisma';

export type RegisterPaymentAdminBody = {
  amount: number;
  image: string;
  isGuest: boolean;
  guestName?: string;
  accountId?: string;
  inscriptions: Inscription[];
};

export type Inscription = {
  id: string;
  index?: number;
  amount?: number;
  status?: InscriptionStatus;
};

export type RegisterPaymentAdminResponse = {
  inscriptions: {
    id: string;
    status: InscriptionStatus;
  }[];
};
