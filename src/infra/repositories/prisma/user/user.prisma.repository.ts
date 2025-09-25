import { UserGateway } from 'src/domain/repositories/user.geteway';
import { prismaClient } from '../client.prisma';
import { USerPrismaModalToUserEntityMapper } from './model/mappers/user-prisma-model-to-user-entity.mapper';
import { User } from 'src/domain/entities/user.entity';
import { UserEntityToUserPrismaModalMapper } from './model/mappers/user-entity-to-user-prisma-model.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserPrismaRepository extends UserGateway {
  public constructor() {
    super();
  }

  public async findByUser(username: string): Promise<User | null> {
    const aModel = await prismaClient.user.findFirst({
      where: { username },
    });

    if (!aModel) return null;

    const anUser = USerPrismaModalToUserEntityMapper.map(aModel);

    return anUser;
  }

  public async findById(id: string): Promise<User | null> {
    const aModel = await prismaClient.user.findUnique({
      where: {
        id,
      },
    });

    if (!aModel) return null;

    const anUser = USerPrismaModalToUserEntityMapper.map(aModel);

    return anUser;
  }
  public async create(user: User): Promise<void> {
    const aModel = UserEntityToUserPrismaModalMapper.map(user);
    await prismaClient.user.create({
      data: aModel,
    });
  }
}
