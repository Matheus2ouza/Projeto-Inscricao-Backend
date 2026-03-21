import {
  genderType,
  InscriptionStatus,
  ShirtSize,
  ShirtType,
} from 'generated/prisma';

export type RegisterGuestInscriptionBody = {
  eventId: string;

  // Dados do inscrito guest
  email: string;
  name: string;
  preferredName?: string;
  cpf: string;
  gender: genderType;
  phone: string;
  locality: string;
  birthDate: Date;

  // dados complementares
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;

  // id da inscrição
  typeInscriptionId: string;
};

export type RegisterGuestInscriptionResponse = {
  id: string;
  status: InscriptionStatus;
  confirmationCode: string;
};
