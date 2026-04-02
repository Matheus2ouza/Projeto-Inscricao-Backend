import { genderType, ShirtSize, ShirtType } from 'generated/prisma';

export type UpdateParticipantsParam = {
  id: string;
};

export type UpdateParticipantsBody = {
  name?: string;
  cpf?: string;
  birthDate?: Date;
  gender?: genderType;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type UpdateParticipantsResponse = {
  id: string;
};
