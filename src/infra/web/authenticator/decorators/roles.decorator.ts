import { SetMetadata } from '@nestjs/common';
export const ROLES_KEY = 'roles';
// Agora espera um único role mínimo
export const Roles = (minRole: string) => SetMetadata(ROLES_KEY, minRole);
