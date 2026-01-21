import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { Account } from 'src/domain/entities/account.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { Usecase } from 'src/usecases/usecase';
import { RegionNotFoundUsecaseException } from 'src/usecases/web/exceptions/accounts/region-not-found.usecase.exception';
import { UserAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/accounts/user-already-exists.usecase.exception';

export type CreateUserInput = {
  username: string;
  password: string;
  role: roleType;
  regionId?: string;
  requesterRole?: string;
  email: string;
};

export type CreateUserOutput = {
  id: string;
};

@Injectable()
export class CreateUserUsecase
  implements Usecase<CreateUserInput, CreateUserOutput>
{
  public constructor(private readonly userGateway: AccountGateway) {}

  public async execute({
    username,
    password,
    role,
    regionId,
    requesterRole,
    email,
  }: CreateUserInput): Promise<CreateUserOutput> {
    // Verifica se o usuário que está tentando criar tem permissão para criar um usuário com a role desejada

    if (regionId) {
      const regionExists = await this.userGateway.findRegionById(regionId);
      if (!regionExists) {
        throw new RegionNotFoundUsecaseException(
          `Region with id ${regionId} does not exist`,
          `A região com id ${regionId} não existe`,
          CreateUserUsecase.name,
        );
      }
    }

    // Verifica se o usuário já existe
    const userExists = await this.userGateway.findByUser(username);

    if (userExists) {
      throw new UserAlreadyExistsUsecaseException(
        `Account already exists while creating account with username: ${username}`,
        `A conta ${username} já existe`,
        CreateUserUsecase.name,
      );
    }

    const anAccount = Account.create({
      username,
      password,
      role,
      regionId,
      email,
    });

    await this.userGateway.create(anAccount);

    const output: CreateUserOutput = {
      id: anAccount.getId(),
    };

    return output;
  }
}
