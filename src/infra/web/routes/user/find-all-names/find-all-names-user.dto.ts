import { roleType } from 'generated/prisma';

export type FindAllNamesUserRequest = {
  roles?: roleType[];
};

export type FindAllNamesUserResponse = {
  id: string;
  username: string;
  role: string;
}[];
