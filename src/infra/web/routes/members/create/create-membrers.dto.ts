import { genderType, ShirtSize, ShirtType } from 'generated/prisma';

export type CreateMembersRequest = {
  accountId: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  birthDate: Date;
  gender: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type CreateMembersResponse = {
  id: string;
};
