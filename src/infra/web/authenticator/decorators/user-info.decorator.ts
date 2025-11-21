import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';

type UserInfoRequestType = Request & {
  userId?: string;
  userRole?: string;
  regionId?: string;
};

export const UserInfo = createParamDecorator<undefined>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserInfoRequestType>();

    const userId = request?.userId;
    const userRole = request?.userRole;
    const regionId = request?.regionId;

    if (!userId || !userRole) {
      throw new UnauthorizedException('User information not found');
    }

    return {
      userId,
      userRole,
      regionId,
    };
  },
);
