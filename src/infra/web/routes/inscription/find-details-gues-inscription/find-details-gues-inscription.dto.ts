import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  PaymentMode,
  ShirtSize,
  ShirtType,
  StatusPayment,
} from 'generated/prisma';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';

export type FindDetailsGuestInscriptionRequest = {
  confirmationCode: string;
};

export type FindDetailsGuestInscriptionResponse = {
  id: string;
  status: InscriptionStatus;
  guestEmail: string;
  guestName: string;
  phone: string;
  createdAt: Date;
  totalValue: number;
  totalPaid: number;
  locality: Locality;
  participant: Participant;
  payments?: Payment[];
  eventConfig: EventConfig;
};

export type EventConfig = {
  participanteConfig: ParticipantFieldsConfig;
  allowedPaymentModes: PaymentMode[];
};

export type Locality = {
  id: string;
  name: string;
};

export type Participant = {
  id: string;
  name: string;
  birthDate: Date;
  gender: genderType;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  cpf: string;
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
  paymentInstallment: PaymentInstallment[];
};

export type PaymentInstallment = {
  id: string;
  installmentNumber: number;
  value: number;
  paidAt?: Date;
};
