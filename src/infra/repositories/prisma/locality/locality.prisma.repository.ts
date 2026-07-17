import { Injectable } from '@nestjs/common';
import { Locality } from 'src/domain/entities/locality/locality.entity';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { LocalityEntityToLocalityPrismaModelMapper as EntityToPrisma } from './model/mappers/locality-entity-to-locality-prisma-model.mapper';
import { LocalityPrismaModelToLocalityEntityMapper as PrismaToEntity } from './model/mappers/locality-prisma-model-to-locality-entity.mapper';

@Injectable()
export class LocalityPrismaRepository implements LocalityGateway {
  constructor(private readonly prisma: PrismaService) {}

  public async create(locality: Locality): Promise<Locality> {
    const data = EntityToPrisma.map(locality);
    const created = await this.prisma.localities.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  public async createTx(
    locality: Locality,
    tx: PrismaTransactionClient,
  ): Promise<Locality> {
    const data = EntityToPrisma.map(locality);
    const created = await tx.localities.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  public async createMany(localities: Locality[]): Promise<number> {
    const data = localities.map(EntityToPrisma.map);
    const created = await this.prisma.localities.createMany({
      data,
      skipDuplicates: true,
    });

    return created.count;
  }

  public async createManyTx(
    localities: Locality[],
    tx: PrismaTransactionClient,
  ): Promise<number> {
    const data = localities.map(EntityToPrisma.map);
    const created = await tx.localities.createMany({
      data,
      skipDuplicates: true,
    });

    return created.count;
  }

  public async findById(id: string): Promise<Locality | null> {
    const found = await this.prisma.localities.findUnique({
      where: {
        id,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }

  public async findByEventId(eventId: string): Promise<Locality[]> {
    const found = await this.prisma.localities.findMany({
      where: {
        region: {
          events: {
            some: {
              id: eventId,
            },
          },
        },
      },
    });

    return found.map(PrismaToEntity.map);
  }
}
