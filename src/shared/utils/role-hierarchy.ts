export enum RoleTypeHierarchy {
  SUPER = 'SUPER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
}

const roleWeight: Record<RoleTypeHierarchy, number> = {
  [RoleTypeHierarchy.SUPER]: 4,
  [RoleTypeHierarchy.ADMIN]: 3,
  [RoleTypeHierarchy.MANAGER]: 2,
  [RoleTypeHierarchy.USER]: 1,
};

// Função para verificar se roleA pode "agir sobre" roleB
export function canActOn(
  roleA: RoleTypeHierarchy,
  roleB: RoleTypeHierarchy,
): boolean {
  return roleWeight[roleA] >= roleWeight[roleB];
}
