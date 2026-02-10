import { Injectable } from '@nestjs/common';
import { genderType, InscriptionStatus } from 'generated/prisma';
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

  async delete(id: string) {
    await this.prisma.inscription.delete({
      where: { id },
    });
  }

  async deleteExpiredGuestInscription(
    ids: string[],
    expiredDate: Date,
  ): Promise<number> {
    const deleted = await this.prisma.inscription.deleteMany({
      where: {
        id: { in: ids },
        status: InscriptionStatus.PENDING,
        payments: {
          none: {},
        },
      },
    });
    return deleted.count;
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

  async findByPaymentId(paymentId: string): Promise<Inscription | null> {
    const found = await this.prisma.inscription.findFirst({
      where: {
        payments: {
          some: {
            paymentId,
          },
        },
      },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByEventId(filters?: {
    eventId: string;
    status?: InscriptionStatus[];
  }): Promise<Inscription[]> {
    const where = this.buildWhereClauseInscription(filters);
    const found = await this.prisma.inscription.findMany({
      where,
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
      orderBy: {
        account: {
          username: 'asc',
        },
      },
    });

    return found.map((item) => PrismaToEntity.map(item));
  }

  async findInscriptionsWithPayments(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<Inscription[]> {
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId: eventId,
      },
      skip,
      take: pageSize,
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

  async findManyByIds(ids: string[]): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async findInscriptionsPending(
    page: number,
    pageSize: number,
    eventId: string,
    accountId: string,
    filter: { status: InscriptionStatus },
  ): Promise<Inscription[]> {
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId: eventId,
        accountId,
        status: filter.status,
      },
      skip,
      take: pageSize,
    });

    return found.map(PrismaToEntity.map);
  }

  // Buscas paginadas
  async findManyPaginated(
    accountId: string,
    eventId: string,
    page: number,
    pageSize: number,
    filters: {
      limitTime?: string;
    },
  ): Promise<Inscription[]> {
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClause(filters);
    const found = await this.prisma.inscription.findMany({
      where: {
        accountId,
        eventId,
        ...where,
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
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

  async findInscriptionsWithPaid(eventId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async findAccountIdsByEventIdPaginated(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<string[]> {
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
      },
      distinct: ['accountId'],
      orderBy: {
        accountId: 'asc',
      },
      skip,
      take: pageSize,
      select: {
        accountId: true,
      },
    });
    return found.map((item) => item.accountId ?? '');
  }

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<Inscription | null> {
    const found = await this.prisma.inscription.findUnique({
      where: {
        confirmationCode,
      },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findManyGuestInscriptionExpired(expired: Date): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        isGuest: true,
        status: InscriptionStatus.PENDING,
        createdAt: {
          lt: expired,
        },
        payments: {
          none: {},
        },
      },
    });

    return found.map(PrismaToEntity.map);
  }

  // Agregações e contagens
  async contTotalDebtByEvent(eventId: string): Promise<number> {
    const debt = await this.prisma.inscription.findMany({
      where: {
        eventId,
        status: {
          in: [InscriptionStatus.PENDING, InscriptionStatus.UNDER_REVIEW],
        },
      },
      select: {
        totalValue: true,
      },
    });

    return debt.reduce((acc, cur) => acc + cur.totalValue.toNumber(), 0);
  }

  async countAll(
    eventId: string,
    filters: {
      limitTime?: string;
    },
    accountId?: string,
  ): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.inscription.count({
      where: {
        accountId,
        eventId,
        ...where,
      },
    });
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

  async countTotalInscriptions(
    eventId: string,
    accountId: string,
  ): Promise<number> {
    const count = await this.prisma.inscription.count({
      where: {
        eventId,
        accountId,
      },
    });
    return count;
  }

  async countPendingInscriptions(
    eventId: string,
    accountId: string,
  ): Promise<number> {
    const count = await this.prisma.inscription.count({
      where: {
        eventId,
        accountId,
        status: 'UNDER_REVIEW',
      },
    });
    return count;
  }

  async countTotalDebt(eventId: string, accountId: string): Promise<number> {
    const count = await this.prisma.inscription.aggregate({
      where: {
        eventId,
        accountId,
        status: { not: 'PAID' },
      },
      _sum: {
        totalValue: true,
      },
    });
    return count._sum.totalValue?.toNumber() ?? 0;
  }

  async countInscriptionsWithPayments(eventId: string): Promise<number> {
    const count = await this.prisma.inscription.count({
      where: {
        eventId,
      },
    });
    return count;
  }

  async countTotal(eventId: string, accountId: string): Promise<number> {
    const count = await this.prisma.inscription.count({
      where: {
        eventId,
        accountId,
        status: 'PENDING',
      },
    });
    return count;
  }

  async countUniqueAccountIdsByEventId(eventId: string): Promise<number> {
    const found = await this.prisma.inscription.groupBy({
      by: ['accountId'],
      where: {
        eventId,
      },
    });

    return found.length;
  }

  async countUniqueAccountIdsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number> {
    const links = await this.prisma.accountParticipantInEvent.findMany({
      where: {
        inscription: {
          eventId,
        },
        participant: {
          gender,
        },
      },
      select: {
        inscription: {
          select: {
            accountId: true,
          },
        },
      },
    });

    const uniqueAccountIds = new Set<string>();
    for (const l of links) {
      uniqueAccountIds.add(l.inscription.accountId ?? '');
    }
    return uniqueAccountIds.size;
  }

  // Busca o total de participantes referente ao evento,
  // somando o total de participantes (guest) e accountParticipantInEvent
  async countParticipantsByEventId(
    eventId: string,
    guest: boolean = false,
    status?: InscriptionStatus[],
  ): Promise<number> {
    const [guestCount, accountCount] = await Promise.all([
      // participantes (guest)
      guest
        ? this.prisma.participant.count({
            where: {
              inscription: {
                eventId,
                isGuest: true,
                status:
                  status && status.length > 0 ? { in: status } : undefined,
              },
            },
          })
        : 0,

      // account participants
      this.prisma.accountParticipantInEvent.count({
        where: {
          inscription: {
            eventId,
            isGuest: false,
            status: status && status.length > 0 ? { in: status } : undefined,
          },
        },
      }),
    ]);

    return guestCount + accountCount;
  }

  // Busca o total de participantes de um sexo específico referente ao evento,
  // somando o total de participantes (guest) e accountParticipantInEvent
  async countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number> {
    const count = await this.prisma.inscription.count({
      where: {
        eventId,
        participants: {
          some: {
            gender,
          },
        },
        accountParticipantInEvent: {
          some: {
            participant: {
              gender,
            },
          },
        },
      },
    });

    return count;
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

  async incrementTotalPaid(id: string, value: number): Promise<Inscription> {
    const aModel = await this.prisma.inscription.update({
      where: { id },
      data: { totalPaid: { increment: value } },
    });
    return PrismaToEntity.map(aModel);
  }

  async incrementTotalPaidMany(
    increments: { inscriptionId: string; value: number }[],
  ): Promise<void> {
    if (increments.length === 0) return;

    await this.prisma.$transaction(
      increments.map((inc) =>
        this.prisma.inscription.update({
          where: { id: inc.inscriptionId },
          data: {
            totalPaid: {
              increment: inc.value,
            },
          },
        }),
      ),
    );
  }

  // Buscas de contas relacionadas
  async findUniqueAccountIdsByEventId(eventId: string): Promise<string[]> {
    const result = await this.prisma.inscription.groupBy({
      by: ['accountId'],
      where: { eventId, accountId: { not: null } },
    });

    return result.map((item) => item.accountId as string);
  }

  async countParticipants(inscriptionId: string): Promise<number> {
    const countParticipants = await this.prisma.participant.count({
      where: { inscriptionId },
    });
    const countAccountParticipants =
      await this.prisma.accountParticipantInEvent.count({
        where: { inscriptionId },
      });
    return countParticipants + countAccountParticipants;
  }

  // Métodos privados
  private buildWhereClause(filters: { limitTime?: string }) {
    const { limitTime } = filters || {};

    return {
      limitTime,
    };
  }

  private buildWhereClauseInscription(filter?: {
    eventId?: string;
    inscriptionId?: string;
    status?: InscriptionStatus[];
    accountId?: string;
  }) {
    const { eventId, inscriptionId, status, accountId } = filter || {};
    return {
      eventId,
      inscriptionId,
      status: status ? { in: status } : undefined,
      accountId,
    };
  }

  // PDF
}
