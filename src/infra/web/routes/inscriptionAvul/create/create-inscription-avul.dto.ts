import { genderType, InscriptionStatus, PaymentMethod } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';

export type CreateInscriptionAvulRequest = {
  eventId: string;
  responsible: string;
  phone: string;
  totalValue: number;
  status: InscriptionStatus;
  paymentMethod: PaymentMethod;
  participants: {
    value: Decimal;
    name: string;
    birthDate: Date;
    gender: genderType;
  }[];
};

export type CreateInscriptionAvulResponse = {
  id: string;
};
