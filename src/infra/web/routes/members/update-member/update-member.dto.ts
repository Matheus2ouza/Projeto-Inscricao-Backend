import { genderType, ShirtSize, ShirtType } from 'generated/prisma';

export type UpdateMemberRequest = {
  id: string;
  name?: string;
  preferredName?: string;
  cpf?: string;
  birthDate?: Date;
  gender?: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type UpdateMemberResponse = {
  id: string;
};
