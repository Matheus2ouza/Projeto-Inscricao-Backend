import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Request } from 'express';
import { roleType } from 'generated/prisma';

type UserRoleRequestType = Request & { userRole?: string };

export type UserRoleType = {
  userRole: roleType;
};

export const UserRole = createParamDecorator<undefined>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRoleRequestType>();
    const userRole = request?.userRole;

    return userRole;
  },
);
