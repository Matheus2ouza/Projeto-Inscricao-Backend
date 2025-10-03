import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';

type userIdRequestType = Request & { userId?: string };

export const UserId = createParamDecorator<undefined>(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<userIdRequestType>();
    const userId = request?.userId;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return userId;
  },
);
