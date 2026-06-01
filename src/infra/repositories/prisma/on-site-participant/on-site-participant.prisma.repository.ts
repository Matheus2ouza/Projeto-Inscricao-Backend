import { Injectable } from '@nestjs/common';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { OnSiteParticipantEntityToOnSiteParticipantPrismaModelMapper as EntityToPrisma } from './model/mappers/on-site-participant-entity-to-on-site-participant-prisma-model.mapper';
import { OnSiteParticipantPrismaModelToOnSiteParticipantEntityMapper as PrismaToEntity } from './model/mappers/on-site-participant-prisma-model-to-on-site-participant-entity.mapper';

@Injectable()
export class OnSiteParticipantPrismaRepository
  implements OnSiteParticipantGateway
{
  public constructor(private readonly prisma: PrismaService) {}

  async create(
    onSiteParticipant: OnSiteParticipant,
  ): Promise<OnSiteParticipant> {
    const data = EntityToPrisma.map(onSiteParticipant);

    const created = await this.prisma.onSiteParticipant.create({ data });

    return PrismaToEntity.map(created);
  }

  async createTx(
    onSiteParticipant: OnSiteParticipant,
    tx: PrismaTransactionClient,
  ): Promise<OnSiteParticipant> {
    const data = EntityToPrisma.map(onSiteParticipant);

    const created = await tx.onSiteParticipant.create({ data });

    return PrismaToEntity.map(created);
  }

  async createManyTx(
    participants: OnSiteParticipant[],
    tx: PrismaTransactionClient,
  ): Promise<number> {
    const data = participants.map((participant) =>
      EntityToPrisma.map(participant),
    );

    const created = await tx.onSiteParticipant.createMany({
      data,
      skipDuplicates: true,
    });

    return created.count;
  }

  async createMany(participants: OnSiteParticipant[]): Promise<number> {
    if (!participants || participants.length === 0) return 0;

    const data = participants.map((participant) =>
      EntityToPrisma.map(participant),
    );

    const created = await this.prisma.onSiteParticipant.createMany({
      data,
      skipDuplicates: true,
    });

    return created.count;
  }

  async upsert(
    onSiteParticipant: OnSiteParticipant,
  ): Promise<OnSiteParticipant> {
    const data = EntityToPrisma.map(onSiteParticipant);
    const created = await this.prisma.onSiteParticipant.upsert({
      where: { id: onSiteParticipant.getId() },
      update: data,
      create: data,
    });

    return PrismaToEntity.map(created);
  }

  async updateManyTx(
    onSiteParticipant: OnSiteParticipant[],
    tx: PrismaTransactionClient,
  ): Promise<number> {
    const data = onSiteParticipant.map(EntityToPrisma.map);
    const updated = await tx.onSiteParticipant.updateMany({
      where: {
        id: {
          in: onSiteParticipant.map((inscription) => inscription.getId()),
        },
      },
      data,
    });
    return updated.count;
  }

  async findById(id: string): Promise<OnSiteParticipant | null> {
    const found = await this.prisma.onSiteParticipant.findUnique({
      where: { id },
    });

    return found ? PrismaToEntity.map(found) : null;
  }

  async findManyByOnSiteRegistrationId(
    onSiteRegistrationId: string,
  ): Promise<OnSiteParticipant[]> {
    const found = await this.prisma.onSiteParticipant.findMany({
      where: {
        onSiteRegistrationId: onSiteRegistrationId,
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async countByOnSiteRegistrationId(
    onSiteRegistrationId: string,
  ): Promise<OnSiteParticipant[]> {
    const found = await this.prisma.onSiteParticipant.findMany({
      where: { onSiteRegistrationId },
    });

    return found.map(PrismaToEntity.map);
  }

  async countParticipantsByOnSiteRegistrationId(
    onSiteRegistrationId: string,
  ): Promise<number> {
    return this.prisma.onSiteParticipant.count({
      where: { onSiteRegistrationId },
    });
  }
}
