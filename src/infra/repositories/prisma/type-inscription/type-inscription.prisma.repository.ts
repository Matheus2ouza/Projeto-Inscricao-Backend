import { Injectable } from '@nestjs/common';
import { TypesInscription } from 'src/domain/entities/typesInscription.entity';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { PrismaService } from '../prisma.service';
import { TypeInscriptionEntityToTypeInscriptionPrismaModelMapper } from './model/mappers/type-inscription-entity-to-type-inscription-prisma-model.mapper';
import { TypeInscriptionPrismaModelToTypeInscriptionEntityMapper } from './model/mappers/type-inscription-prisma-model-to-type-inscription-entity.mapper';

@Injectable()
export class TypeInscriptionPrismaRepository implements TypeInscriptionGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(typeInscription: TypesInscription): Promise<TypesInscription> {
    const data =
      TypeInscriptionEntityToTypeInscriptionPrismaModelMapper.map(
        typeInscription,
      );
    const created = await this.prisma.typeInscriptions.create({ data });
    return TypeInscriptionPrismaModelToTypeInscriptionEntityMapper.map(created);
  }

  async findById(id: string): Promise<TypesInscription | null> {
    const found = await this.prisma.typeInscriptions.findUnique({
      where: { id },
    });
    return found
      ? TypeInscriptionPrismaModelToTypeInscriptionEntityMapper.map(found)
      : null;
  }

  async findByDescription(
    eventId: string,
    description: string,
  ): Promise<TypesInscription | null> {
    const found = await this.prisma.typeInscriptions.findFirst({
      where: { eventId, description },
    });
    return found
      ? TypeInscriptionPrismaModelToTypeInscriptionEntityMapper.map(found)
      : null;
  }

  async findAll(): Promise<TypesInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      include: { event: { select: { name: true } } },
    });
    return found.map(
      TypeInscriptionPrismaModelToTypeInscriptionEntityMapper.map,
    );
  }

  async findByEventId(eventId: string): Promise<TypesInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      where: { eventId },
      orderBy: { value: 'desc' },
    });
    return found.map(
      TypeInscriptionPrismaModelToTypeInscriptionEntityMapper.map,
    );
  }

  async findAllDescription(): Promise<TypesInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      select: { id: true, description: true, value: true },
    });

    return found.map(
      TypeInscriptionPrismaModelToTypeInscriptionEntityMapper.map,
    );
  }
}
