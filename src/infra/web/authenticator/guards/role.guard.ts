import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const userRole = request.userRole;
    if (!userRole || !requiredRoles.includes(userRole)) {
      console.warn(
        `RoleGuard: acesso negado para role='${userRole}' nas roles permitidas: [${requiredRoles.join(', ')}]`,
      );
      throw new ForbiddenException('Você não tem permissão para essa ação.');
    }
    return true;
  }
}
