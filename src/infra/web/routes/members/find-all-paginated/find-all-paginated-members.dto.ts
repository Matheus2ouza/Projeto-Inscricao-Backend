import { genderType } from 'generated/prisma';

export type FindAllPaginatedMembersRequest = {
  accountId: string;
  page: number;
  pageSize: number;
};

export type FindAllPaginatedMembersResponse = {
  members: Member[];
  total: number;
  page: number;
  pageCount: number;
};

export type Member = {
  id: string;
  name: string;
  cpf?: string;
  birthDate: Date;
  gender: genderType;
  createdAt: Date;
};
