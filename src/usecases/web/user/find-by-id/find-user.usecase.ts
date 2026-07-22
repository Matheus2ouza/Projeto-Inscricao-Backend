import { Injectable } from '@nestjs/common';
import { Region } from 'src/domain/entities/region.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { Usecase } from 'src/usecases/usecase';
import { AccountNotFoundUsecaseException } from 'src/usecases/web/exceptions/accounts/account-not-found.usecase.exception';

export type FindUserInput = {
  id: string;
};

export type FindUserOutput = {
  id: string;
  username: string;
  role: string;
  email?: string;
  regionId?: string;
};

@Injectable()
export class FindUserUsecase implements Usecase<FindUserInput, FindUserOutput> {
  public constructor(
    private readonly userGateway: AccountGateway,
    private readonly regionGateway: RegionGateway,
  ) {}

  public async execute({ id }: FindUserInput): Promise<FindUserOutput> {
    const anUser = await this.userGateway.findById(id);

    if (!anUser) {
      throw new AccountNotFoundUsecaseException(
        `Account not found with finding user with id ${id} in ${FindUserUsecase.name}`,
        `Conta não encontrada`,
        FindUserUsecase.name,
      );
    }

    let region: Region | null = null;
    const regionId = anUser.getRegionId();
    if (regionId) {
      region = await this.regionGateway.findById(regionId);
    }

    const output: FindUserOutput = {
      id: anUser.getId(),
      username: anUser.getUsername(),
      email: anUser.getEmail(),
      role: anUser.getRole(),
      regionId: region?.getId(),
    };

    return output;
  }
}
