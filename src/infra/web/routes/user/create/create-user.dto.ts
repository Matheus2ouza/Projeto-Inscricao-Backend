import { roleType } from 'generated/prisma';

export type CreateUserRequest = {
  username: string;
  password: string;
  role: roleType;
};

export type CreateUserRouteResponse = {
  id: string;
};
