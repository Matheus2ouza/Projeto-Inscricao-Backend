import { Injectable } from '@nestjs/common';
import { ExclusiveInscriptionLink } from 'src/domain/entities/exclusive-inscription-link.entity';
import { ExclusiveInscriptionLinkGateway } from 'src/domain/repositories/exclusive-inscription-link.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { ExclusiveInscriptionLinkEntityToExclusiveInscriptionLinkPrismaModelMapper as EntityToPrisma } from './model/mappers/exclusive-inscription-link-entity-to-exclusive-inscription-link-prisma-model.mapper';
import { ExclusiveInscriptionLinkPrismaModelToExclusiveInscriptionLinkEntityMapper as PrismaToEntity } from './model/mappers/exclusive-inscription-link-prisma-model-to-exclusive-inscription-link-entity.mapper';

@Injectable()
export class ExclusiveInscriptionLinkPrismaRepository
  implements ExclusiveInscriptionLinkGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    exclusiveInscriptionLink: ExclusiveInscriptionLink,
  ): Promise<ExclusiveInscriptionLink> {
    const data = EntityToPrisma.map(exclusiveInscriptionLink);
    const created = await this.prisma.exclusiveInscriptionLink.create({ data });
    return PrismaToEntity.map(created);
  }

  async createTx(
    exclusiveInscriptionLink: ExclusiveInscriptionLink,
    tx: PrismaTransactionClient,
  ): Promise<ExclusiveInscriptionLink> {
    const data = EntityToPrisma.map(exclusiveInscriptionLink);
    const created = await tx.exclusiveInscriptionLink.create({ data });
    return PrismaToEntity.map(created);
  }
}
