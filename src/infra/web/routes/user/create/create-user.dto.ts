import { roleType } from 'generated/prisma';

export type CreateUserRequest = {
  username: string;
  password: string;
  role: roleType;
  localityId: string;
  regionId?: string;
  email: string;
};

export type CreateUserRouteResponse = {
  id: string;
};
