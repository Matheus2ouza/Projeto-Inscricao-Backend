import { Injectable } from '@nestjs/common';
import { Participant } from 'src/domain/entities/participant.entity';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PrismaService } from '../prisma.service';
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

  async create(participant: Participant): Promise<void> {
    await this.prisma.participant.create({
      data: {
        id: participant.getId(),
        inscriptionId: participant.getInscriptionId(),
        typeInscriptionId: participant.getTypeInscriptionId(),
        name: participant.getName(),
        birthDate: participant.getBirthDate(),
        gender: participant.getGender(),
        createdAt: participant.getCreatedAt(),
        // updatedAt is handled by Prisma @updatedAt
      },
    });
  }

  async update(participant: Participant): Promise<void> {
    await this.prisma.participant.update({
      where: { id: participant.getId() },
      data: {
        inscriptionId: participant.getInscriptionId(),
        typeInscriptionId: participant.getTypeInscriptionId(),
        name: participant.getName(),
        birthDate: participant.getBirthDate(),
        gender: participant.getGender(),
        createdAt: participant.getCreatedAt(),
        // updatedAt is handled by Prisma @updatedAt
      },
    });
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
}
