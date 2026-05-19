import { roleType } from 'generated/prisma';

export type FindAllNamesUserQuery = {
  roles?: roleType[];
};

export type FindAllNamesUserResponse = {
  id: string;
  username: string;
  role: string;
}[];
