import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { canActOn, RoleTypeHierarchy } from 'src/shared/utils/role-hierarchy';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Espera um role mínimo (string ou enum) no metadata
    const minRoleRaw = this.reflector.getAllAndOverride<string>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!minRoleRaw) return true;

    const { userRole } = context.switchToHttp().getRequest();
    const user = userRole?.toUpperCase();
    const min = minRoleRaw.toUpperCase();
    if (
      !user ||
      !min ||
      !(user in RoleTypeHierarchy) ||
      !(min in RoleTypeHierarchy)
    ) {
      console.warn(
        `[RoleGuard] Valor de role inválido. user: ${user}, min: ${min}`,
      );
      throw new ForbiddenException('Você não tem permissão para essa ação.');
    }
    if (!canActOn(user as RoleTypeHierarchy, min as RoleTypeHierarchy)) {
      console.warn(
        `RoleGuard: acesso negado para role='${user}' (mínimo exigido: ${min})`,
      );
      throw new ForbiddenException('Você não tem permissão para essa ação.');
    }
    return true;
  }
}

export const RoleGuardProvider = {
  provide: 'APP_GUARD',
  useClass: RoleGuard,
};
