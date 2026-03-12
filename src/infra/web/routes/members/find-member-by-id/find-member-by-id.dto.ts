import { genderType, ShirtSize, ShirtType } from 'generated/prisma';

export type FindMemberByIdRequest = {
  id: string;
};

export type FindMemberByIdResponse = {
  id: string;
  name: string;
  preferredName?: string;
  cpf?: string;
  birthDate: Date;
  gender: genderType;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  createdAt: string;
};
