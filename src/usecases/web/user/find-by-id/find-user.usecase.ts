import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { Usecase } from 'src/usecases/usecase';
import { AccountNotFoundUsecaseException } from 'src/usecases/web/exceptions/accounts/account-not-found.usecase.exception';

export type FindUserInput = {
  id: string;
};

export type FindUserOutput = {
  id: string;
  username: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  regionId: string | undefined;
};

@Injectable()
export class FindUserUsecase implements Usecase<FindUserInput, FindUserOutput> {
  public constructor(private readonly userGateway: AccountGateway) {}

  public async execute({ id }: FindUserInput): Promise<FindUserOutput> {
    const anUser = await this.userGateway.findById(id);

    if (!anUser) {
      throw new AccountNotFoundUsecaseException(
        `Account not found with finding user with id ${id} in ${FindUserUsecase.name}`,
        `Conta não encontrada`,
        FindUserUsecase.name,
      );
    }
    const output: FindUserOutput = {
      id: anUser.getId(),
      username: anUser.getUsername(),
      role: anUser.getRole(),
      createdAt: anUser.getCreatedAt(),
      updatedAt: anUser.getUpdatedAt(),
      regionId: anUser.getRegionId(),
    };

    return output;
  }
}
