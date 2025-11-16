import { Injectable } from '@nestjs/common';
import { roleType } from 'generated/prisma';
import { User } from 'src/domain/entities/user.entity';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { PrismaService } from '../prisma.service';
import { UserEntityToUserPrismaModelMapper } from './model/mappers/user-entity-to-user-prisma-model.mapper';
import { UserPrismaModelToUserEntityMapper } from './model/mappers/user-prisma-model-to-user-entity.mapper';

@Injectable()
export class UserPrismaRepository implements UserGateway {
  constructor(private readonly prisma: PrismaService) {}

  public async findByUser(username: string): Promise<User | null> {
    const aModel = await this.prisma.accounts.findFirst({
      where: { username },
    });

    if (!aModel) return null;

    const anUser = UserPrismaModelToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async findById(id: string): Promise<User | null> {
    const aModel = await this.prisma.accounts.findUnique({
      where: {
        id,
      },
    });

    if (!aModel) return null;

    const anUser = UserPrismaModelToUserEntityMapper.map(aModel);

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

  public async create(user: User): Promise<void> {
    const aModel = UserEntityToUserPrismaModelMapper.map(user);
    await this.prisma.accounts.create({
      data: aModel,
    });
  }

  public async findManyPaginated(
    page: number,
    pageSize: number,
  ): Promise<User[]> {
    const skip = (page - 1) * pageSize;

    const models = await this.prisma.accounts.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
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

    return models.map(UserPrismaModelToUserEntityMapper.map);
  }

  async findAll(roles?: string[]): Promise<User[]> {
    const roleValues = roles
      ? roles
          .map((role) => roleType[role as keyof typeof roleType])
          .filter((role): role is roleType => role !== undefined)
      : [roleType.ADMIN, roleType.SUPER, roleType.MANAGER];

    const found = await this.prisma.accounts.findMany({
      where: {
        role: {
          in: roleValues,
        },
      },
    });
    return found.map(UserPrismaModelToUserEntityMapper.map);
  }

  public async countAll(): Promise<number> {
    const total = await this.prisma.accounts.count();
    return total;
  }

  public async findByIds(ids: string[]): Promise<User[]> {
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

    return models.map(UserPrismaModelToUserEntityMapper.map);
  }
}
