import { genderType, ShirtSize, ShirtType } from 'generated/prisma';

export type UpdateParticipantsRequest = {
  id: string;
  name?: string;
  birthDate?: Date;
  gender?: genderType;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type UpdateParticipantsResponse = {
  id: string;
};
