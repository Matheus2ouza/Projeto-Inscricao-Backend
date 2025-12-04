import { Injectable } from '@nestjs/common';
import { Participant } from 'src/domain/entities/participant.entity';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PrismaService } from '../prisma.service';
import { ParticipantEntityToParticipantPrismaModelMapper as EntityToPrisma } from './model/mapper/participant-entity-to-participant-prisma-model.mapper';
import { ParticipantPrismaModelToParticipantEntityMapper as PrismaToEntity } from './model/mapper/participant-prisma-model-to-participant-entity.mapper';

@Injectable()
export class ParticipantPrismaRepository implements ParticipantGateway {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Participant | null> {
    const found = await this.prisma.participant.findUnique({ where: { id } });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByInscriptionId(inscriptionId: string): Promise<Participant[]> {
    const found = await this.prisma.participant.findMany({
      where: { inscriptionId },
      include: { typeInscription: { select: { description: true } } },
    });
    return found.map(PrismaToEntity.map);
  }

  async findByName(name: string): Promise<Participant[]> {
    const found = await this.prisma.participant.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
    });
    return found.map(PrismaToEntity.map);
  }

  async create(participant: Participant): Promise<Participant> {
    const data = EntityToPrisma.map(participant);
    const created = await this.prisma.participant.create({
      data,
      include: { typeInscription: { select: { description: true } } },
    });
    return PrismaToEntity.map(created);
  }

  async update(participant: Participant): Promise<Participant> {
    const data = EntityToPrisma.map(participant);
    const updated = await this.prisma.participant.update({
      where: { id: participant.getId() },
      data,
      include: { typeInscription: { select: { description: true } } },
    });
    return PrismaToEntity.map(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.participant.delete({ where: { id } });
  }

  async findManyPaginated(
    page: number,
    pageSize: number,
  ): Promise<Participant[]> {
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.participant.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
    return found.map(PrismaToEntity.map);
  }

  async countAll(): Promise<number> {
    return this.prisma.participant.count();
  }

  async countByInscriptionId(inscriptionId: string): Promise<number> {
    return this.prisma.participant.count({ where: { inscriptionId } });
  }

  async countAllByEventId(eventId: string): Promise<number> {
    return this.prisma.participant.count({
      where: {
        inscription: {
          eventId,
        },
      },
    });
  }

  async findManyPaginatedByInscriptionId(
    inscriptionId: string,
    page: number,
    pageSize: number,
  ): Promise<Participant[]> {
    const skip = (page - 1) * pageSize;

    const modals = await this.prisma.participant.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      where: { inscriptionId },
    });

    return modals.map(PrismaToEntity.map);
  }

  async countAllByInscriptionId(inscriptionId: string): Promise<number> {
    const total = await this.prisma.participant.count({
      where: { inscriptionId: inscriptionId },
    });

    return total;
  }

  async findManyByInscriptionIds(
    inscriptionIds: string[],
  ): Promise<Participant[]> {
    if (inscriptionIds.length === 0) {
      return [];
    }

    const found = await this.prisma.participant.findMany({
      where: {
        inscriptionId: { in: inscriptionIds },
      },
      include: { typeInscription: { select: { description: true } } },
    });

    return found.map(PrismaToEntity.map);
  }

  async findByAccountIdAndEventId(
    accountId: string,
    eventId: string,
    limit: number,
  ): Promise<Participant[]> {
    const found = await this.prisma.participant.findMany({
      where: {
        inscription: {
          accountId,
          eventId,
        },
      },
      include: { typeInscription: { select: { description: true } } },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return found.map(PrismaToEntity.map);
  }

  async countByAccountIdAndEventId(
    accountId: string,
    eventId: string,
  ): Promise<number> {
    return this.prisma.participant.count({
      where: {
        inscription: {
          accountId,
          eventId,
          status: { notIn: ['UNDER_REVIEW', 'CANCELLED'] },
        },
      },
    });
  }
}
