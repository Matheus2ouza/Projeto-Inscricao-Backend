import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllNamesUserInput = {
  regionId?: string;
  role: roleType;
  findRoles?: roleType[];
};

export type FindAllNamesUserOutput = {
  id: string;
  username: string;
  role: string;
}[];

const ROLE_HIERARCHY: Record<roleType, number> = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3,
  SUPER: 4,
};

@Injectable()
export class FindAllNamesUserUsecase
  implements Usecase<FindAllNamesUserInput, FindAllNamesUserOutput>
{
  public constructor(private readonly userGateway: AccountGateway) {}

  public async execute(
    input: FindAllNamesUserInput,
  ): Promise<FindAllNamesUserOutput> {
    const allowedRoles = this.getAllowedRoles(input.role, input.findRoles);

    const allUsers = await this.userGateway.findAllNames(
      allowedRoles,
      input.regionId,
    );

    return allUsers.map((user) => ({
      id: user.getId(),
      username: user.getUsername(),
      role: user.getRole(),
    }));
  }

  private getAllowedRoles(
    callerRole: roleType,
    findRoles?: roleType[],
  ): roleType[] {
    const callerLevel = ROLE_HIERARCHY[callerRole];

    const visibleRoles = (Object.keys(ROLE_HIERARCHY) as roleType[]).filter(
      (role) => ROLE_HIERARCHY[role] <= callerLevel,
    );

    if (!findRoles || findRoles.length === 0) {
      return visibleRoles;
    }

    return findRoles.filter((role) => visibleRoles.includes(role));
  }
}
