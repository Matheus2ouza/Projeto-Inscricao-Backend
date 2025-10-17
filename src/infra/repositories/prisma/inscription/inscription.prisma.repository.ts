import { Injectable } from '@nestjs/common';
import { InscriptionStatus } from 'generated/prisma';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PrismaService } from '../prisma.service';
import { InscriptionEntityToInscriptionPrismaModelMapper as EntityToPrisma } from './model/mappers/inscription-entity-to-inscription-prisma-model.mapper';
import { InscriptionPrismaModalToInscriptionEntityMapper as PrismaToEntity } from './model/mappers/inscription-prisma-model-to-inscription-entity.mapper';

@Injectable()
export class InscriptionPrismaRepository implements InscriptionGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(inscription: Inscription): Promise<Inscription> {
    const data = EntityToPrisma.map(inscription);
    const created = await this.prisma.inscription.create({ data });
    return PrismaToEntity.map(created);
  }

  async findById(id: string): Promise<Inscription | null> {
    console.log('o id que chegou: ', id);
    const found = await this.prisma.inscription.findUnique({ where: { id } });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByAccountId(accountId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: { accountId },
    });
    return found.map(PrismaToEntity.map);
  }

  async findManyPaginated(
    page: number,
    pageSize: number,
    filters: {
      userId: string;
      eventId?: string;
      limitTime?: string;
    },
  ): Promise<Inscription[]> {
    const skip = (page - 1) * pageSize;

    const where = this.buildWhereClause(filters);

    const found = await this.prisma.inscription.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async countAll(filters: {
    userId: string;
    eventId?: string;
  }): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.inscription.count({ where });
  }

  async sumTotalDebt(filters: {
    userId: string;
    eventId?: string;
    limitTime?: string;
  }): Promise<number> {
    const where = this.buildWhereClause(filters);

    const result = await this.prisma.inscription.aggregate({
      where: {
        ...where,
        status: { not: 'PAID' }, // Soma apenas inscrições não pagas
      },
      _sum: {
        totalValue: true,
      },
    });

    return Number(result._sum.totalValue) || 0;
  }

  async countParticipants(filters: {
    userId: string;
    eventId?: string;
  }): Promise<number> {
    const where = this.buildWhereClause(filters);

    // Conta participantes através da relação
    const result = await this.prisma.participant.count({
      where: {
        inscription: where, // Filtra pelos mesmos critérios da inscrição
      },
    });

    return result;
  }

  private buildWhereClause(filters: {
    userId: string;
    eventId?: string;
    limitTime?: string;
  }) {
    const where: any = {
      accountId: filters.userId,
    };

    // Filtro opcional por eventId
    if (filters.eventId) {
      where.eventId = filters.eventId;
    }

    // Filtro opcional por limitTime
    if (filters.limitTime) {
      const limitDate = new Date(filters.limitTime);
      where.createdAt = {
        gte: limitDate,
      };
    }

    return where;
  }

  async decrementValue(id: string, value: number): Promise<Inscription> {
    const aModel = await this.prisma.inscription.update({
      where: { id },
      data: { totalValue: { decrement: value } },
    });

    return PrismaToEntity.map(aModel);
  }

  async updateStatus(
    id: string,
    status: InscriptionStatus,
  ): Promise<Inscription> {
    const aModel = await this.prisma.inscription.update({
      where: { id },
      data: { status: status },
    });

    return PrismaToEntity.map(aModel);
  }

  async paidRegistration(id: string): Promise<Inscription> {
    const aModel = await this.prisma.inscription.update({
      where: { id },
      data: { status: 'PAID' },
    });

    return PrismaToEntity.map(aModel);
  }

  async findManyPaginatedByEvent(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<Inscription[]> {
    const skip = (page - 1) * pageSize;

    const modals = await this.prisma.inscription.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      where: { eventId: eventId },
    });

    return modals.map(PrismaToEntity.map);
  }

  async countAllByEvent(eventId: string): Promise<number> {
    const total = await this.prisma.inscription.count({
      where: { eventId },
    });
    return total;
  }
}
