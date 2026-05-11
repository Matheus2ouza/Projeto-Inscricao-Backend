import { Injectable } from '@nestjs/common';
import { ExclusiveInscriptionLinkType } from 'src/domain/entities/exclusive-inscription-link-type.entity';
import { ExclusiveInscriptionLinkTypeGateway } from 'src/domain/repositories/exclusive-inscription-link-type.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { ExclusiveInscriptionLinkTypeEntityToExclusiveInscriptionLinkTypePrismaModelMapper as EntityToPrisma } from './model/mappers/exclusive-inscription-link-type-entity-to-exclusive-inscription-link-type-prisma-model.mapper';
import { ExclusiveInscriptionLinkTypePrismaModelToExclusiveInscriptionLinkTypeEntityMapper as PrismaToEntity } from './model/mappers/exclusive-inscription-link-type-prisma-model-to-exclusive-inscription-link-type-entity.mapper';

@Injectable()
export class ExclusiveInscriptionLinkTypePrismaRepository
  implements ExclusiveInscriptionLinkTypeGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    exclusiveInscriptionLinkType: ExclusiveInscriptionLinkType,
  ): Promise<ExclusiveInscriptionLinkType> {
    const data = EntityToPrisma.map(exclusiveInscriptionLinkType);
    const created = await this.prisma.exclusiveInscriptionLinkType.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  async createTx(
    exclusiveInscriptionLinkType: ExclusiveInscriptionLinkType,
    tx: PrismaTransactionClient,
  ): Promise<ExclusiveInscriptionLinkType> {
    const data = EntityToPrisma.map(exclusiveInscriptionLinkType);
    const created = await tx.exclusiveInscriptionLinkType.create({ data });

    return PrismaToEntity.map(created);
  }

  async findByExclusiveLinkId(
    exclusiveLinkId: string,
  ): Promise<ExclusiveInscriptionLinkType[]> {
    const found = await this.prisma.exclusiveInscriptionLinkType.findMany({
      where: {
        exclusiveLinkId,
      },
    });

    return found.map(PrismaToEntity.map);
  }
}
