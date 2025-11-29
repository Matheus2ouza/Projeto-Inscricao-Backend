import { genderType } from 'generated/prisma';

export type UpdateParticipantsRequest = {
  participantId: string;
  name: string;
  birthDate: Date;
  gender: genderType;
  typeInscriptionId: string;
};

export type UpdateParticipantsResponse = {
  id: string;
};
