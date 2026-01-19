import { Injectable } from '@nestjs/common';
import { TypesInscription } from 'src/domain/entities/typesInscription.entity';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { PrismaService } from '../prisma.service';
import { TypeInscriptionEntityToTypeInscriptionPrismaModelMapper as EntityToPrisma } from './model/mappers/type-inscription-entity-to-type-inscription-prisma-model.mapper';
import { TypeInscriptionPrismaModelToTypeInscriptionEntityMapper as PrismaToEntity } from './model/mappers/type-inscription-prisma-model-to-type-inscription-entity.mapper';

@Injectable()
export class TypeInscriptionPrismaRepository implements TypeInscriptionGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(typeInscription: TypesInscription): Promise<TypesInscription> {
    const data = EntityToPrisma.map(typeInscription);
    const created = await this.prisma.typeInscriptions.create({ data });
    return PrismaToEntity.map(created);
  }

  async update(typeInscription: TypesInscription): Promise<TypesInscription> {
    const data = EntityToPrisma.map(typeInscription);
    const updated = await this.prisma.typeInscriptions.update({
      where: { id: typeInscription.getId() },
      data,
    });

    return PrismaToEntity.map(updated);
  }

  async findById(id: string): Promise<TypesInscription | null> {
    const found = await this.prisma.typeInscriptions.findUnique({
      where: { id },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByIds(ids: string[]): Promise<TypesInscription[]> {
    const data = await this.prisma.typeInscriptions.findMany({
      where: { id: { in: ids } },
    });

    return data.map(PrismaToEntity.map);
  }

  async findByDescription(
    eventId: string,
    description: string,
  ): Promise<TypesInscription | null> {
    const found = await this.prisma.typeInscriptions.findFirst({
      where: { eventId, description },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findAll(): Promise<TypesInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      include: { event: { select: { name: true } } },
    });
    return found.map(PrismaToEntity.map);
  }

  async findByEventId(eventId: string): Promise<TypesInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      where: { eventId },
      orderBy: { value: 'desc' },
    });
    return found.map(PrismaToEntity.map);
  }

  async findSpecialTypes(eventId: string): Promise<TypesInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      where: { eventId, specialType: true },
      orderBy: { value: 'desc' },
    });
    return found.map(PrismaToEntity.map);
  }

  async findAllDescription(): Promise<TypesInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      select: { id: true, description: true, value: true },
    });

    return found.map(PrismaToEntity.map);
  }

  async countAllByEvent(eventId: string): Promise<number> {
    return await this.prisma.typeInscriptions.count({
      where: { eventId },
    });
  }
}
