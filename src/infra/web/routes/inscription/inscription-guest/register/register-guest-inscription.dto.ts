import {
  genderType,
  InscriptionStatus,
  ShirtSize,
  ShirtType,
} from 'generated/prisma';

export type RegisterGuestInscriptionParam = {
  eventId: string;
};

export type RegisterGuestInscriptionBody = {
  localityId: string;

  // Dados do inscrito guest obrigatórios
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  cpf: string;
  gender: genderType;

  // Dados da inscrição guest opcionais
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;

  // id da inscrição
  typeInscriptionId: string;
};

export type RegisterGuestInscriptionResponse = {
  id: string;
  status: InscriptionStatus;
  confirmationCode?: string;
  expiresAt?: Date | string;
};
