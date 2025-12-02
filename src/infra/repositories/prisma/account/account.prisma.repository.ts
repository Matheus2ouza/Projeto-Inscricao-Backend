import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { Account } from 'src/domain/entities/account.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { PrismaService } from '../prisma.service';
import { AccountEntityToUserPrismaModelMapper } from './model/mappers/account-entity-to-account-prisma-model.mapper';
import { AccountPrismaModelToUserEntityMapper } from './model/mappers/account-prisma-model-to-account-entity.mapper';

@Injectable()
export class AccountPrismaRepository implements AccountGateway {
  constructor(private readonly prisma: PrismaService) {}

  public async findByUser(username: string): Promise<Account | null> {
    const aModel = await this.prisma.accounts.findFirst({
      where: { username },
    });

    if (!aModel) return null;

    const anUser = AccountPrismaModelToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async findById(id: string): Promise<Account | null> {
    const aModel = await this.prisma.accounts.findUnique({
      where: {
        id,
      },
    });

    if (!aModel) return null;

    const anUser = AccountPrismaModelToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async findRegionById(id: string): Promise<any | null> {
    const region = await this.prisma.regions.findUnique({
      where: {
        id,
      },
    });

    if (!region) return null;

    return region;
  }

  public async create(user: Account): Promise<void> {
    const aModel = AccountEntityToUserPrismaModelMapper.map(user);
    await this.prisma.accounts.create({
      data: aModel,
    });
  }

  public async findManyPaginated(
    page: number,
    pageSize: number,
    regionId?: string,
  ): Promise<Account[]> {
    const skip = (page - 1) * pageSize;
    const where = regionId ? { regionId } : {};

    const models = await this.prisma.accounts.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        region: {
          select: {
            name: true,
          },
        },
      },
    });

    return models.map(AccountPrismaModelToUserEntityMapper.map);
  }

  async findAllNames(roles?: roleType[]): Promise<Account[]> {
    const found = await this.prisma.accounts.findMany({
      where: {
        role: {
          in: roles,
        },
      },
    });
    return found.map(AccountPrismaModelToUserEntityMapper.map);
  }

  public async countAll(regionId: string): Promise<number> {
    const where = regionId ? { regionId } : {};

    const total = await this.prisma.accounts.count({
      where,
    });
    return total;
  }

  public async findByIds(ids: string[]): Promise<Account[]> {
    if (ids.length === 0) {
      return [];
    }

    const models = await this.prisma.accounts.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        id: true,
        username: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        regionId: true,
        email: true,
        imageUrl: true,
        region: {
          select: {
            name: true,
          },
        },
      },
    });

    return models.map(AccountPrismaModelToUserEntityMapper.map);
  }
}
