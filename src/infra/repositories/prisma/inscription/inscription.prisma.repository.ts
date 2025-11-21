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

  // CRUD básico
  async create(inscription: Inscription): Promise<Inscription> {
    const data = EntityToPrisma.map(inscription);
    const created = await this.prisma.inscription.create({ data });
    return PrismaToEntity.map(created);
  }

  async update(inscription: Inscription): Promise<Inscription> {
    const data = EntityToPrisma.map(inscription);
    const updated = await this.prisma.inscription.update({
      where: { id: inscription.getId() },
      data,
    });

    return PrismaToEntity.map(updated);
  }

  async deleteInscription(id: string) {
    await this.prisma.inscription.delete({
      where: { id },
    });
  }

  // Buscas por identificador único
  async findById(id: string): Promise<Inscription | null> {
    const found = await this.prisma.inscription.findUnique({ where: { id } });
    return found ? PrismaToEntity.map(found) : null;
  }

  // Buscas por relacionamento
  async findByAccountId(accountId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: { accountId },
    });
    return found.map(PrismaToEntity.map);
  }

  async findByEventId(eventId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: { eventId },
    });
    return found.map(PrismaToEntity.map);
  }

  async findByEventIdAndAccountId(
    eventId: string,
    accountId: string,
  ): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
        accountId,
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async findManyByEventAndAccountIds(
    eventId: string,
    accountIds: string[],
  ): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
        accountId: { in: accountIds },
      },
      include: { participants: true },
    });

    return found.map((item) => PrismaToEntity.map(item));
  }

  async findMany(eventId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: { eventId },
    });

    return found.map(PrismaToEntity.map);
  }

  // Buscas paginadas
  async findManyPaginated(
    page: number,
    pageSize: number,
    filters: {
      userId: string;
      eventId: string;
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

  async findLimitedByEvent(
    eventId: string,
    limit: number,
  ): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return found.map(PrismaToEntity.map);
  }

  // Agregações e contagens
  async contTotalDebtByEvent(eventId: string): Promise<number> {
    const count = await this.prisma.inscription.aggregate({
      where: {
        eventId,
        status: {
          not: 'PAID',
        },
      },
      _sum: {
        totalValue: true,
      },
    });
    return count._sum.totalValue?.toNumber() ?? 0;
  }

  async countAll(filters: {
    userId: string;
    eventId: string;
    limitTime?: string;
  }): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.inscription.count({ where });
  }

  async countAllByEvent(eventId: string): Promise<number> {
    const total = await this.prisma.inscription.count({
      where: { eventId },
    });
    return total;
  }

  async countAllInAnalysis(eventId: string): Promise<number> {
    const total = await this.prisma.inscription.count({
      where: { eventId, status: 'UNDER_REVIEW' },
    });

    return total;
  }

  async countParticipants(filters: {
    userId: string;
    eventId: string;
    limitTime?: string;
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

  async sumTotalDebt(filters: {
    userId: string;
    eventId: string;
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

  // Atualizações de status e valor
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

  async updateValue(id: string, value: number): Promise<Inscription> {
    const aModel = await this.prisma.inscription.update({
      where: { id },
      data: { totalValue: value },
    });
    return PrismaToEntity.map(aModel);
  }

  async decrementValue(id: string, value: number): Promise<Inscription> {
    const aModel = await this.prisma.inscription.update({
      where: { id },
      data: { totalValue: { decrement: value } },
    });

    return PrismaToEntity.map(aModel);
  }

  // Buscas de contas relacionadas
  async findUniqueAccountIdsByEventId(eventId: string): Promise<string[]> {
    const result = await this.prisma.inscription.groupBy({
      by: ['accountId'],
      where: { eventId },
    });

    return result.map((item) => item.accountId);
  }

  async findUniqueAccountIdsPaginatedByEventId(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<{ accountIds: string[]; total: number }> {
    // Primeiro, obter todas as contas únicas do evento
    const uniqueAccountsResult = await this.prisma.inscription.groupBy({
      by: ['accountId'],
      where: { eventId },
    });

    const uniqueAccountIds = uniqueAccountsResult.map((item) => item.accountId);
    const total = uniqueAccountIds.length;

    if (uniqueAccountIds.length === 0) {
      return { accountIds: [], total: 0 };
    }

    // Buscar os usernames das contas para ordenação
    const accounts = await this.prisma.accounts.findMany({
      where: {
        id: { in: uniqueAccountIds },
      },
      select: {
        id: true,
        username: true,
      },
    });

    // Criar mapa de accountId -> username
    const accountMap = new Map(
      accounts.map((account) => [account.id, account.username]),
    );

    // Ordenar accountIds por username
    const sortedAccountIds = uniqueAccountIds.sort((a, b) => {
      const usernameA = accountMap.get(a) || '';
      const usernameB = accountMap.get(b) || '';
      return usernameA.localeCompare(usernameB);
    });

    // Aplicar paginação nas contas ordenadas
    const skip = (page - 1) * pageSize;
    const paginatedAccountIds = sortedAccountIds.slice(skip, skip + pageSize);

    return {
      accountIds: paginatedAccountIds,
      total,
    };
  }

  // Métodos privados
  private buildWhereClause(filters: {
    userId: string;
    eventId: string;
    limitTime?: string;
  }) {
    const where: any = {
      accountId: filters.userId,
      eventId: filters.eventId,
    };

    // Filtro opcional por limitTime
    if (filters.limitTime) {
      const limitDate = new Date(filters.limitTime);
      where.createdAt = {
        gte: limitDate,
      };
    }

    return where;
  }

  // PDF
}
