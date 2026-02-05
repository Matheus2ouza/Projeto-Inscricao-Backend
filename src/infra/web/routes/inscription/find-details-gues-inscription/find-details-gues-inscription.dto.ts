import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';

export type FindDetailsGuestInscriptionRequest = {
  confirmationCode: string;
};

export type FindDetailsGuestInscriptionResponse = {
  id: string;
  status: InscriptionStatus;
  guestEmail: string;
  guestName: string;
  guestLocality: string;
  phone: string;
  createdAt: Date;
  participants: Participant[];
  payments?: Payment[];
};

export type Participant = {
  id: string;
  name: string;
  birthDate: Date;
  gender: genderType;
  typeInscription: TypeInscription;
};

export type TypeInscription = {
  description: string;
  price: number;
};

export type Payment = {
  id: string;
  status: StatusPayment;
  method: PaymentMethod;
  installments: number;
  rejectionReason?: string;
  imageUrl?: string;
  totalValue: number;
  totalPaid: number;
  paidInstallments: number;
  PaymentInstallment: PaymentInstallment[];
};

export type PaymentInstallment = {
  id: string;
  installmentNumber: number;
  value: number;
  paidAt?: Date;
};
