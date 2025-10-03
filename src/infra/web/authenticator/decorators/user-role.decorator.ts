import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';

type UserRoleRequestType = Request & { userRole?: string };

export const UserRole = createParamDecorator<undefined>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRoleRequestType>();
    const userRole = request?.userRole;

    if (!userRole) {
      throw new UnauthorizedException('User role not found');
    }

    return userRole;
  },
);
