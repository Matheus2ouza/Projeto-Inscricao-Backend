import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SyncTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const syncToken = request.headers['x-sync-token'];

    if (typeof syncToken !== 'string' || syncToken !== process.env.SYNC_SECRET) {
      throw new UnauthorizedException('Invalid sync token');
    }

    return true;
  }
}

