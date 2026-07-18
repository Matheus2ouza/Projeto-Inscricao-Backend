import { Injectable } from '@nestjs/common';
import { AccountLocality } from 'src/domain/entities/account-locality/account-locality.entity';
import { AccountLocalityGateway } from 'src/domain/repositories/account-locality.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { AccountLocalityEntityToAccountLocalityPrismaModelMapper as EntityToPrisma } from './model/mappers/account-locality-entity-to-account-locality-prisma-model.mapper';
import { AccountLocalityPrismaModelToAccountLocalityEntityMapper as PrismaToEntity } from './model/mappers/account-locality-prisma-model-to-account-locality-entity.mapper';

@Injectable()
export class AccountLocalityPrismaRepository implements AccountLocalityGateway {
  constructor(private readonly prisma: PrismaService) {}

  public async create(
    accountLocality: AccountLocality,
  ): Promise<AccountLocality> {
    const data = EntityToPrisma.map(accountLocality);
    const created = await this.prisma.accountLocality.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  public async createTx(
    accountLocality: AccountLocality,
    tx: PrismaTransactionClient,
  ): Promise<AccountLocality> {
    const data = EntityToPrisma.map(accountLocality);
    const created = await tx.accountLocality.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  public async createMany(
    accountLocalities: AccountLocality[],
  ): Promise<number> {
    const data = accountLocalities.map(EntityToPrisma.map);
    const created = await this.prisma.accountLocality.createMany({
      data,
      skipDuplicates: true,
    });

    return created.count;
  }

  public async createManyTx(
    accountLocalities: AccountLocality[],
    tx: PrismaTransactionClient,
  ): Promise<number> {
    const data = accountLocalities.map(EntityToPrisma.map);
    const created = await tx.accountLocality.createMany({
      data,
      skipDuplicates: true,
    });

    return created.count;
  }

  public async findById(id: string): Promise<AccountLocality | null> {
    const found = await this.prisma.accountLocality.findUnique({
      where: {
        id,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }
}
