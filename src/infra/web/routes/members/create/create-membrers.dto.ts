import { genderType } from 'generated/prisma';

export type CreateMembersRequest = {
  accountId: string;
  name: string;
  birthDate: Date;
  gender: genderType;
};

export type CreateMembersResponse = {
  id: string;
};
