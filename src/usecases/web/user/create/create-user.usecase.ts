import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { AccountLocality } from 'src/domain/entities/account-locality/account-locality.entity';
import { Account } from 'src/domain/entities/account/account.entity';
import { Region } from 'src/domain/entities/region.entity';
import { AccountLocalityGateway } from 'src/domain/repositories/account-locality.gateway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { Usecase } from 'src/usecases/usecase';
import { RegionNotFoundUsecaseException } from 'src/usecases/web/exceptions/accounts/region-not-found.usecase.exception';
import { UserAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/accounts/user-already-exists.usecase.exception';
import { LocalityNotFoundUsecaseException } from '../../exceptions/locality/locality-not-found.usecase.exception';

export type CreateUserInput = {
  username: string;
  password: string;
  role: roleType;
  regionId?: string;
  localityId: string;
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
  public constructor(
    private readonly userGateway: AccountGateway,
    private readonly regionGateway: RegionGateway,
    private readonly localityGateway: LocalityGateway,
    private readonly accountLocalityGateway: AccountLocalityGateway,
    private readonly prisma: PrismaService,
  ) {}

  public async execute({
    username,
    password,
    role,
    regionId,
    localityId,
    requesterRole,
    email,
  }: CreateUserInput): Promise<CreateUserOutput> {
    // Verifica se o usuário que está tentando criar tem permissão para criar um usuário com a role desejada

    let region: Region | null = null;

    // Busca a região somente quando regionId for fornecido
    if (regionId) {
      region = await this.regionGateway.findById(regionId);
      if (!region) {
        throw new RegionNotFoundUsecaseException(
          `Region with id ${regionId} does not exist`,
          `A região com id ${regionId} não existe`,
          CreateUserUsecase.name,
        );
      }
    }

    // Verifica se o usuário já existe
    const userExists = await this.userGateway.findByUsername(username);

    if (userExists) {
      throw new UserAlreadyExistsUsecaseException(
        `Account already exists while creating account with username: ${username}`,
        `A conta ${username} já existe`,
        CreateUserUsecase.name,
      );
    }

    const locality = await this.localityGateway.findById(localityId);
    if (!locality) {
      throw new LocalityNotFoundUsecaseException(
        `Tentativa de criar uma nova conta mas a localidade passado é invalida: ${localityId}`,
        `Localidade invalida ou indefinida`,
        CreateUserUsecase.name,
      );
    }

    const account = Account.create({
      username,
      password,
      role,
      regionId: region?.getId(),
      email,
    });

    const accountLocality = AccountLocality.create({
      accountId: account.getId(),
      localityId: locality.getId(),
    });

    await this.prisma.runInTransaction(async (tx) => {
      await this.userGateway.createTx(account, tx);
      await this.accountLocalityGateway.createTx(accountLocality, tx);
    });

    const output: CreateUserOutput = {
      id: account.getId(),
    };

    return output;
  }
}
