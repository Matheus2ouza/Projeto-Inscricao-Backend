import { UserGateway } from 'src/domain/repositories/user.geteway';
import { prismaClient } from '../client.prisma';
import { UserPrismaModelToUserEntityMapper } from './model/mappers/user-prisma-model-to-user-entity.mapper';
import { User } from 'src/domain/entities/user.entity';
import { UserEntityToUserPrismaModelMapper } from './model/mappers/user-entity-to-user-prisma-model.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserPrismaRepository extends UserGateway {
  public constructor() {
    super();
  }

  public async findByUser(username: string): Promise<User | null> {
    const aModel = await prismaClient.accounts.findFirst({
      where: { username },
    });

    if (!aModel) return null;

    const anUser = UserPrismaModelToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async findById(id: string): Promise<User | null> {
    const aModel = await prismaClient.accounts.findUnique({
      where: {
        id,
      },
    });

    if (!aModel) return null;

    const anUser = UserPrismaModelToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async findRegionById(id: string): Promise<any | null> {
    const region = await prismaClient.regions.findUnique({
      where: {
        id,
      },
    });

    if (!region) return null;

    return region;
  }

  public async create(user: User): Promise<void> {
    const aModel = UserEntityToUserPrismaModelMapper.map(user);
    await prismaClient.accounts.create({
      data: aModel,
    });
  }

  public async findManyPaginated(
    page: number,
    pageSize: number,
  ): Promise<User[]> {
    const skip = (page - 1) * pageSize;

    const models = await prismaClient.accounts.findMany({
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
        region: {
          select: {
            name: true,
          },
        },
      },
    });

    return models.map(UserPrismaModelToUserEntityMapper.map);
  }

  public async countAll(): Promise<number> {
    const total = await prismaClient.accounts.count();
    return total;
  }
}
