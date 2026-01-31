import { genderType, InscriptionStatus } from 'generated/prisma';

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
  birthDate: Date;
  gender: genderType;
  typeInscriptionId: string;
};

export type RegisterGuestInscriptionResponse = {
  id: string;
  status: InscriptionStatus;
  confirmationCode: string;
};
