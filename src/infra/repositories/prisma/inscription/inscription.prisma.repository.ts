import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
} from 'generated/prisma';
import { Inscription } from 'src/domain/entities/inscription.entity';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PrismaService } from '../prisma.service';
import { InscriptionEntityToInscriptionPrismaModelMapper as EntityToPrisma } from './model/mappers/inscription-entity-to-inscription-prisma-model.mapper';
import { InscriptionPrismaModalToInscriptionEntityMapper as PrismaToEntity } from './model/mappers/inscription-prisma-model-to-inscription-entity.mapper';

@Injectable()
export class InscriptionPrismaRepository implements InscriptionGateway {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD básico
  // Cria uma nova inscrição
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

  async updateMany(inscriptions: Inscription[]): Promise<number> {
    const data = inscriptions.map((inscription) =>
      EntityToPrisma.map(inscription),
    );
    const updated = await this.prisma.inscription.updateMany({
      where: {
        id: {
          in: inscriptions.map((inscription) => inscription.getId()),
        },
      },
      data,
    });
    return updated.count;
  }

  async cancel(inscription: Inscription): Promise<Inscription> {
    const data = EntityToPrisma.map(inscription);
    const canceled = await this.prisma.inscription.update({
      where: { id: inscription.getId() },
      data,
    });
    return PrismaToEntity.map(canceled);
  }

  async delete(id: string) {
    await this.prisma.inscription.delete({
      where: { id },
    });
  }

  async deleteMany(ids: string[]): Promise<number> {
    const deleted = await this.prisma.inscription.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return deleted.count;
  }

  async deleteExpiredGuestInscription(
    ids: string[],
    now: Date,
  ): Promise<number> {
    const deleted = await this.prisma.inscription.deleteMany({
      where: {
        id: { in: ids },
        isGuest: true,
        status: InscriptionStatus.EXPIRED,
        cancelledAt: {
          lte: now,
        },
        payments: {
          none: {},
        },
      },
    });
    return deleted.count;
  }

  // Buscas por identificador único
  async findById(
    id: string,
    filters?: { isGuest?: boolean },
  ): Promise<Inscription | null> {
    const where = this.buildWhereClauseInscription(filters);
    const found = await this.prisma.inscription.findUnique({
      where: { id, ...where },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  // Buscas por relacionamento
  async findByAccountId(accountId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: { accountId },
    });
    return found.map(PrismaToEntity.map);
  }

  async findByPaymentId(paymentId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        payments: {
          some: {
            paymentId,
          },
        },
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async findByEventId(
    eventId: string,
    filters?: {
      status?: InscriptionStatus[];
    },
  ): Promise<Inscription[]> {
    const where = this.buildWhereClauseInscription(filters);
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
        ...where,
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async findAllNamesByEventId(eventId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
      },
      distinct: ['guestName', 'responsible'],
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

  async findMany(
    eventId: string,
    filters?: {
      status?: InscriptionStatus[];
      isGuest?: boolean;
      endDate?: string;
      accountId?: string;
      responsible?: string;
    },
  ): Promise<Inscription[]> {
    const where = this.buildWhereClauseInscription(filters);
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
        ...where,
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async findManyInscriptionsToGenerateReport(
    eventId: string,
    filters?: {
      status?: InscriptionStatus | InscriptionStatus[];
      statusPayment?: StatusPayment | StatusPayment[];
      methodPayment?: PaymentMethod | PaymentMethod[];
      isGuest?: boolean;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Inscription[]> {
    const where = this.buildWhereClauseInscription(filters);
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
        ...where,
      },
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
    eventId: string,
    page: number,
    pageSize: number,
    filters?: {
      status?: InscriptionStatus | InscriptionStatus[];
      isGuest?: boolean;
      accountId?: string;
      orderByCreatedAt?: 'asc' | 'desc';
      orderByResponsible?: 'asc' | 'desc';
      endDate?: string;
      responsible?: string;
    },
  ): Promise<Inscription[]> {
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClauseInscription(filters);
    const sortOrderCreatedAt =
      filters?.orderByCreatedAt === 'asc' ? 'asc' : 'desc';
    const sortOrderResponsible =
      filters?.orderByResponsible === 'asc' ? 'asc' : 'desc';
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
        ...where,
        responsible: {
          contains: filters?.responsible,
          mode: 'insensitive',
        },
      },
      skip,
      take: pageSize,
      orderBy: [
        { responsible: sortOrderResponsible },
        { createdAt: sortOrderCreatedAt },
      ],
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

  async findByLocality(eventId: string): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        eventId,
        status: InscriptionStatus.PAID,
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

  // Busca a inscrição por codigo de confirmação,
  // levando em consideração que a inscrição não pode estar expirada e nem ter expirado
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

  // Busca das inscrições Guest que expiraram
  async findManyGuestInscriptionExpired(now: Date): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        isGuest: true,
        status: InscriptionStatus.PENDING,
        expiresAt: {
          lt: now,
        },
        payments: {
          none: {},
        },
      },
    });

    return found.map(PrismaToEntity.map);
  }

  // Busca das inscrições Guest que foram marcadas como expiradas
  async findManyGuestInscriptionMarkedExpired(
    now: Date,
  ): Promise<Inscription[]> {
    const found = await this.prisma.inscription.findMany({
      where: {
        status: InscriptionStatus.EXPIRED,
        isGuest: true,
        cancelledAt: {
          lte: now,
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
        totalPaid: true,
      },
    });

    const totalDebt = debt.reduce((acc, cur) => {
      const inscriptionDebt = cur.totalValue.minus(cur.totalPaid);
      return acc.plus(inscriptionDebt);
    }, new Decimal(0));

    return totalDebt.toNumber();
  }

  async countAll(
    eventId: string,
    filters: {
      status?: InscriptionStatus[];
      isGuest?: boolean;
      endDate?: string;
      accountId?: string;
      responsible?: string;
    },
  ): Promise<number> {
    const where = this.buildWhereClauseInscription(filters);
    return this.prisma.inscription.count({
      where: {
        eventId,
        ...where,
        responsible: {
          contains: filters?.responsible,
          mode: 'insensitive',
        },
      },
    });
  }

  async countAllInscriptionsToGenerateReport(
    eventId: string,
    filters?: {
      status?: InscriptionStatus | InscriptionStatus[];
      statusPayment?: StatusPayment | StatusPayment[];
      methodPayment?: PaymentMethod | PaymentMethod[];
      isGuest?: boolean;
      endDate?: string;
    },
  ): Promise<number> {
    const where = this.buildWhereClauseInscription(filters);
    const count = await this.prisma.inscription.count({
      where: {
        eventId,
        ...where,
      },
    });
    return count;
  }

  async countAllByEvent(
    eventId: string,
    filters?: { isGuest?: boolean },
  ): Promise<number> {
    const total = await this.prisma.inscription.count({
      where: { eventId, ...filters },
    });
    return total;
  }

  async countAllGuestByEvent(eventId: string): Promise<number> {
    const total = await this.prisma.inscription.count({
      where: { eventId, isGuest: true },
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

  async countTotalPaid(eventId: string, accountId?: string): Promise<number> {
    const where = this.buildWhereClauseInscription({ accountId });

    const result = await this.prisma.inscription.aggregate({
      where: {
        eventId,
        ...where,
      },
      _sum: {
        totalPaid: true,
      },
    });

    return Number(result._sum.totalPaid || 0);
  }

  async countTotalDue(eventId: string, accountId?: string): Promise<number> {
    const where = this.buildWhereClauseInscription({ accountId });

    const result = await this.prisma.inscription.aggregate({
      where: {
        ...where,
        eventId,
        status: where.status ?? {
          in: [
            InscriptionStatus.PENDING,
            InscriptionStatus.UNDER_REVIEW,
            InscriptionStatus.EXPIRED,
          ],
        },
      },
      _sum: {
        totalValue: true,
        totalPaid: true,
      },
    });

    const totalValue = Number(result._sum.totalValue ?? 0);
    const totalPaid = Number(result._sum.totalPaid ?? 0);

    return Math.max(totalValue - totalPaid, 0);
  }

  // Busca o total de participantes referente ao evento,
  // somando o total de participantes (guest) e accountParticipantInEvent
  async countParticipantsByEventId(
    eventId: string,
    filters?: {
      isGuest?: boolean;
      status?: InscriptionStatus | InscriptionStatus[];
    },
  ): Promise<number> {
    const where = this.buildWhereClauseInscription(filters);
    const [guestCount, accountCount] = await Promise.all([
      // participantes (guest)
      where.isGuest
        ? this.prisma.participant.count({
            where: {
              inscription: {
                eventId,
                isGuest: where.isGuest, // passa o guest como forma
              },
            },
          })
        : 0,

      // account participants
      this.prisma.accountParticipantInEvent.count({
        where: {
          inscription: {
            eventId,
            isGuest: where.isGuest,
            status: where.status,
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

  private buildWhereClauseInscription(filters?: {
    status?: InscriptionStatus | InscriptionStatus[];
    statusPayment?: StatusPayment | StatusPayment[];
    methodPayment?: PaymentMethod | PaymentMethod[];
    isGuest?: boolean;
    startDate?: string;
    endDate?: string;
    accountId?: string;
    responsible?: string;
  }) {
    const {
      status,
      statusPayment,
      methodPayment,
      isGuest,
      startDate,
      endDate,
      accountId,
      responsible,
    } = filters || {};

    const statusArray = status
      ? Array.isArray(status)
        ? status
        : [status]
      : [];

    const statusPaymentArray = statusPayment
      ? Array.isArray(statusPayment)
        ? statusPayment
        : [statusPayment]
      : [];

    const methodPaymentArray = methodPayment
      ? Array.isArray(methodPayment)
        ? methodPayment
        : [methodPayment]
      : [];

    const createdAt =
      startDate || endDate
        ? {
            gte: startDate ? new Date(startDate) : undefined,
            lte: endDate ? new Date(endDate) : undefined,
          }
        : undefined;

    const paymentFilter =
      (statusPaymentArray && statusPaymentArray.length > 0) ||
      (methodPaymentArray && methodPaymentArray.length > 0)
        ? {
            status:
              statusPaymentArray && statusPaymentArray.length > 0
                ? { in: statusPaymentArray }
                : undefined,
            methodPayment:
              methodPaymentArray && methodPaymentArray.length > 0
                ? { in: methodPaymentArray }
                : undefined,
          }
        : undefined;

    return {
      status:
        statusArray && statusArray.length > 0 ? { in: statusArray } : undefined,
      isGuest,
      createdAt,
      accountId,
      responsible: responsible ? { contains: responsible } : undefined,
      payments: paymentFilter
        ? { some: { payment: paymentFilter } }
        : undefined,
    };
  }

  // PDF
}
