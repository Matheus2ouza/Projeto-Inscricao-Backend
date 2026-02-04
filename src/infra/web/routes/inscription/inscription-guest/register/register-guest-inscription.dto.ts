import {
  genderType,
  InscriptionStatus,
  ShirtSize,
  ShirtType,
} from 'generated/prisma';

export type RegisterGuestInscriptionRequest = {
  eventId: string;
  guestEmail: string;
  guestName: string;
  guestLocality: string;
  phone: string;
  participant: ParticipantGuest;
};

export type ParticipantGuest = {
  name: string;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  birthDate: Date;
  gender: genderType;
  typeInscriptionId: string;
};

export type RegisterGuestInscriptionResponse = {
  id: string;
  status: InscriptionStatus;
  confirmationCode: string;
};
