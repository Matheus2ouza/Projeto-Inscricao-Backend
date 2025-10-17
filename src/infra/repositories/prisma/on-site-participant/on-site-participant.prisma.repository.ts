import { Injectable } from '@nestjs/common';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { PrismaService } from '../prisma.service';
import { OnSiteParticipantEntityToOnSiteParticipantPrismaModelMapper } from './model/mappers/on-site-participant-entity-to-on-site-participant-prisma-model.mapper';
import { OnSiteParticipantPrismaModelToOnSiteParticipantEntityMapper } from './model/mappers/on-site-participant-prisma-model-to-on-site-participant-entity.mapper';

@Injectable()
export class OnSiteParticipantPrismaRepository
  implements OnSiteParticipantGateway
{
  public constructor(private readonly prisma: PrismaService) {}

  async create(
    onSiteParticipant: OnSiteParticipant,
  ): Promise<OnSiteParticipant> {
    const data =
      OnSiteParticipantEntityToOnSiteParticipantPrismaModelMapper.map(
        onSiteParticipant,
      );

    const created = await this.prisma.onSiteParticipant.create({ data });

    return OnSiteParticipantPrismaModelToOnSiteParticipantEntityMapper.map(
      created,
    );
  }

  async createMany(participants: OnSiteParticipant[]): Promise<void> {
    if (!participants || participants.length === 0) return;

    const data = participants.map((participant) =>
      OnSiteParticipantEntityToOnSiteParticipantPrismaModelMapper.map(
        participant,
      ),
    );

    await this.prisma.onSiteParticipant.createMany({
      data,
      skipDuplicates: true,
    });
  }
}
