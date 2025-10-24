import { genderType, InscriptionStatus, PaymentMethod } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

export type CreateInscriptionAvulRequest = {
  eventId: string;
  responsible: string;
  phone: string;
  totalValue: number;
  status: InscriptionStatus;
  participants: {
    name: string;
    birthDate: Date;
    gender: genderType;
    payments: {
      paymentMethod: PaymentMethod;
      value: Decimal;
    }[];
  }[];
};

export type CreateInscriptionAvulResponse = {
  id: string;
};
