import { Injectable } from '@nestjs/common';
import { genderType, InscriptionStatus } from 'generated/prisma';
import { Participant } from 'src/domain/entities/participant.entity';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PrismaService } from '../prisma.service';
import { ParticipantEntityToParticipantPrismaModelMapper as EntityToPrisma } from './model/mapper/participant-entity-to-participant-prisma-model.mapper';
import { ParticipantPrismaModelToParticipantEntityMapper as PrismaToEntity } from './model/mapper/participant-prisma-model-to-participant-entity.mapper';

@Injectable()
export class ParticipantPrismaRepository implements ParticipantGateway {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD básico
  async create(participant: Participant): Promise<Participant> {
    const data = EntityToPrisma.map(participant);
    const created = await this.prisma.participant.create({
      data,
      include: { typeInscription: { select: { description: true } } },
    });
    return PrismaToEntity.map(created);
  }

  async createMany(participants: Participant[]): Promise<Participant[]> {
    const data = participants.map(EntityToPrisma.map);
    const created = await this.prisma.participant.createMany({
      data,
    });
    return created.count === participants.length ? participants : [];
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

  // Buscas por identificador único
  async findById(id: string): Promise<Participant | null> {
    const found = await this.prisma.participant.findUnique({
      where: { id },
      include: { typeInscription: { select: { description: true } } },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  // Buscas por relacionamento
  async findByName(name: string): Promise<Participant[]> {
    const found = await this.prisma.participant.findMany({
      where: { name: { contains: name, mode: 'insensitive' } },
      include: { typeInscription: { select: { description: true } } },
      orderBy: { name: 'asc' },
    });
    return found.map(PrismaToEntity.map);
  }

  async findByInscriptionId(inscriptionId: string): Promise<Participant[]> {
    const found = await this.prisma.participant.findMany({
      where: { inscriptionId },
      include: { typeInscription: { select: { description: true } } },
      orderBy: { name: 'asc' },
    });
    return found.map(PrismaToEntity.map);
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

  // Buscas paginadas
  async findManyByEventId(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<Participant[]> {
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.participant.findMany({
      skip,
      take: pageSize,
      where: {
        inscription: {
          eventId,
          isGuest: true,
          status: InscriptionStatus.PAID,
        },
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async findManyPaginatedByInscriptionId(
    inscriptionId: string,
    page: number,
    pageSize: number,
  ): Promise<Participant[]> {
    const skip = (page - 1) * pageSize;

    const participants = await this.prisma.participant.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      where: { inscriptionId },
      include: { typeInscription: { select: { description: true } } },
    });

    return participants.map(PrismaToEntity.map);
  }

  async findByInscriptionsIds(
    inscriptionIds: string[],
  ): Promise<Participant[]> {
    const found = await this.prisma.participant.findMany({
      where: {
        inscriptionId: { in: inscriptionIds },
        inscription: { status: InscriptionStatus.PAID, isGuest: true },
      },
    });

    return found.map(PrismaToEntity.map);
  }

  // Agregações e contagens
  async countAll(): Promise<number> {
    return this.prisma.participant.count();
  }

  async countByInscriptionId(inscriptionId: string): Promise<number> {
    return this.prisma.participant.count({
      where: { inscriptionId },
    });
  }

  async countAllByInscriptionId(inscriptionId: string): Promise<number> {
    return this.prisma.participant.count({
      where: { inscriptionId },
    });
  }

  async countAllByEventId(eventId: string): Promise<number> {
    return this.prisma.participant.count({
      where: {
        inscription: {
          eventId,
          isGuest: true,
          status: InscriptionStatus.PAID,
        },
      },
    });
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

  async countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number> {
    return this.prisma.participant.count({
      where: {
        inscription: {
          eventId,
          isGuest: true,
          status: InscriptionStatus.PAID,
        },
        gender,
      },
    });
  }

  async countParticipantsByEventId(
    eventId: string,
    userId?: string,
  ): Promise<number> {
    const count = await this.prisma.participant.count({
      where: {
        inscription: {
          eventId,
          accountId: userId,
          isGuest: true,
        },
      },
    });
    return count;
  }
}
