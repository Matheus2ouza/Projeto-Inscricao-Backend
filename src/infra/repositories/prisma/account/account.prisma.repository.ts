import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { Account } from 'src/domain/entities/account/account.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { PrismaService } from '../prisma.service';
import { AccountEntityToUserPrismaModelMapper } from './model/mappers/account-entity-to-account-prisma-model.mapper';
import { AccountPrismaModelToUserEntityMapper as PrismaToEntity } from './model/mappers/account-prisma-model-to-account-entity.mapper';

@Injectable()
export class AccountPrismaRepository implements AccountGateway {
  constructor(private readonly prisma: PrismaService) {}

  // ============ CREATES ============
  public async create(user: Account): Promise<void> {
    const aModel = AccountEntityToUserPrismaModelMapper.map(user);
    await this.prisma.accounts.create({
      data: aModel,
    });
  }

  // ============ FINDS ============
  public async findById(id: string): Promise<Account | null> {
    const aModel = await this.prisma.accounts.findUnique({
      where: {
        id,
      },
    });

    if (!aModel) return null;

    const anUser = PrismaToEntity.map(aModel);

    return anUser;
  }

  public async findByIds(ids: string[]): Promise<Account[]> {
    const models = await this.prisma.accounts.findMany({
      where: {
        id: { in: ids },
      },
      orderBy: {
        username: 'asc',
      },
    });

    return models.map(PrismaToEntity.map);
  }

  public async findByUsername(username: string): Promise<Account | null> {
    const aModel = await this.prisma.accounts.findFirst({
      where: { username },
    });

    if (!aModel) return null;

    const anUser = PrismaToEntity.map(aModel);

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

  public async findAll(): Promise<Account[]> {
    const found = await this.prisma.accounts.findMany({
      orderBy: { username: 'asc' },
    });
    return found.map(PrismaToEntity.map);
  }

  public async findAllNames(
    roles?: roleType[],
    regionId?: string,
  ): Promise<Account[]> {
    const found = await this.prisma.accounts.findMany({
      where: {
        role: {
          in: roles,
        },
        regionId,
      },
    });
    return found.map(PrismaToEntity.map);
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

    return models.map(PrismaToEntity.map);
  }

  public async findByEventIdWithPagination(
    page: number,
    pageSize: number,
    eventId: string,
    id?: string,
    debit?: boolean,
  ): Promise<Account[]> {
    const skip = (page - 1) * pageSize;
    const inscriptionFilter: Record<string, any> = { eventId };
    if (debit) {
      inscriptionFilter.status = {
        not: 'PAID',
      };
    }
    const where = {
      id,
      Inscription: {
        some: inscriptionFilter,
      },
    };
    const found = await this.prisma.accounts.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { username: 'asc' },
    });

    return found.map(PrismaToEntity.map);
  }

  // ============ COUNTS ============
  public async countAll(regionId: string): Promise<number> {
    const where = regionId ? { regionId } : {};

    const total = await this.prisma.accounts.count({
      where,
    });
    return total;
  }

  public async countAllFiltered(
    eventId: string,
    id?: string,
    debit?: boolean,
  ): Promise<number> {
    const inscriptionFilter: Record<string, any> = { eventId };
    if (debit) {
      inscriptionFilter.status = {
        not: 'PAID',
      };
    }
    const count = await this.prisma.accounts.count({
      where: {
        id,
        Inscription: {
          some: inscriptionFilter,
        },
      },
    });
    return count;
  }

  public async countAccountsWithInscriptionsByEvent(
    eventId: string,
  ): Promise<number> {
    const total = await this.prisma.accounts.count({
      where: {
        Inscription: {
          some: {
            eventId,
          },
        },
      },
    });

    return total;
  }

  // ============ VALIDATIONS ============
  public async verifyActiveAccount(username: string): Promise<Account | null> {
    const found = await this.prisma.accounts.findFirst({
      where: {
        username,
        active: true,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }

  public async findEligibleResponsibles(ids: string[]): Promise<Account[]> {
    const found = await this.prisma.accounts.findMany({
      where: {
        id: { in: ids },
        role: {
          not: roleType.USER,
        },
      },
    });

    return found.map(PrismaToEntity.map);
  }

  // ============ PRIVATE METHODS ============
  private buildWhereClauseAccount(filter?: { eventId: string; id?: string }) {
    const { eventId, id } = filter || {};
    return {
      eventId,
      id,
    };
  }
}
