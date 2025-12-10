import { Injectable } from '@nestjs/common';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { PrismaService } from '../prisma.service';
import { OnSiteParticipantEntityToOnSiteParticipantPrismaModelMapper as PrismaToEntity } from './model/mappers/on-site-participant-entity-to-on-site-participant-prisma-model.mapper';
import { OnSiteParticipantPrismaModelToOnSiteParticipantEntityMapper as EntityToPrisma } from './model/mappers/on-site-participant-prisma-model-to-on-site-participant-entity.mapper';

@Injectable()
export class OnSiteParticipantPrismaRepository
  implements OnSiteParticipantGateway
{
  public constructor(private readonly prisma: PrismaService) {}

  async create(
    onSiteParticipant: OnSiteParticipant,
  ): Promise<OnSiteParticipant> {
    const data = PrismaToEntity.map(onSiteParticipant);

    const created = await this.prisma.onSiteParticipant.create({ data });

    return EntityToPrisma.map(created);
  }

  async createMany(participants: OnSiteParticipant[]): Promise<void> {
    if (!participants || participants.length === 0) return;

    const data = participants.map((participant) =>
      PrismaToEntity.map(participant),
    );

    await this.prisma.onSiteParticipant.createMany({
      data,
      skipDuplicates: true,
    });
  }

  async findManyByOnSiteRegistrationId(
    onSiteRegistrationId: string,
  ): Promise<OnSiteParticipant[]> {
    const found = await this.prisma.onSiteParticipant.findMany({
      where: {
        onSiteRegistrationId: onSiteRegistrationId,
      },
    });

    return found.map(EntityToPrisma.map);
  }

  async countByOnSiteRegistrationId(
    onSiteRegistrationId: string,
  ): Promise<OnSiteParticipant[]> {
    const found = await this.prisma.onSiteParticipant.findMany({
      where: { onSiteRegistrationId },
    });

    return found.map(EntityToPrisma.map);
  }

  async countParticipantsByOnSiteRegistrationId(
    onSiteRegistrationId: string,
  ): Promise<number> {
    return this.prisma.onSiteParticipant.count({
      where: { onSiteRegistrationId },
    });
  }
}
