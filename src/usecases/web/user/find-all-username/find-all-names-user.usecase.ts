import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { Usecase } from 'src/usecases/usecase';

export type FindAllNamesUserInput = {
  roles?: roleType[];
};

export type FindAllNamesUserOutput = {
  id: string;
  username: string;
  role: string;
}[];

@Injectable()
export class FindAllNamesUserUsecase
  implements Usecase<FindAllNamesUserInput, FindAllNamesUserOutput>
{
  public constructor(private readonly userGateway: AccountGateway) {}

  public async execute(
    input: FindAllNamesUserInput,
  ): Promise<FindAllNamesUserOutput> {
    const allUsers = await this.userGateway.findAllNames(input.roles);

    return allUsers.map((user) => ({
      id: user.getId(),
      username: user.getUsername(),
      role: user.getRole(),
    }));
  }
}
