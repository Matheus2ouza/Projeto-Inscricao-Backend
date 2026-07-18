import { genderType, InscriptionStatus } from 'generated/prisma';

export type InscriptionExclusiveLinkBody = {
  eventId: string;
  localityId: string;
  exclusiveInscriptionLink: string;

  // Dados do inscrito
  email: string;
  name: string;
  preferredName?: string;
  cpf: string;
  gender: genderType;
  phone: string;
  guestLocality: string;
  birthDate: Date;

  //dados complementares
  observation: string;

  // id da inscrição
  typeInscriptionId: string;
};

export type InscriptionExclusiveLinkResponse = {
  id: string;
  status: InscriptionStatus;
  confirmationCode: string;
};
