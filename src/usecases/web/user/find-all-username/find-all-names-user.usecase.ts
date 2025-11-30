import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';

export type FindAllNamesUserInput = {
  roles?: string[];
};

export type FindAllNamesUserOutput = {
  id: string;
  username: string;
  role: string;
}[];

@Injectable()
export class FindAllNamesUserUsecase {
  public constructor(private readonly userGateway: AccountGateway) {}

  public async execute(
    input: FindAllNamesUserInput,
  ): Promise<FindAllNamesUserOutput> {
    const allUsers = await this.userGateway.findAll(input.roles);

    return allUsers.map((user) => ({
      id: user.getId(),
      username: user.getUsername(),
      role: user.getRole(),
    }));
  }
}
