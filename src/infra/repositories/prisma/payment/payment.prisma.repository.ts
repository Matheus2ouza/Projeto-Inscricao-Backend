import { Injectable } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { Payment } from 'src/domain/entities/payment.entity';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { PaymentEntityToPaymentPrismaModelMapper as EntityToPrisma } from 'src/infra/repositories/prisma/payment/model/mappers/payment-entity-to-payment-prisma-model.mapper';
import { PaymentPrismaModelToPaymentEntityMapper as PrismaToEntity } from 'src/infra/repositories/prisma/payment/model/mappers/payment-prisma-model-to-payment-entity.mapper';
import { PaymentsSummary } from 'src/usecases/web/payments/list-all-payments/list-all-payments.usecase';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentPrismaRepository implements PaymentGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(payment: Payment): Promise<Payment> {
    const data = EntityToPrisma.map(payment);
    const created = await this.prisma.payment.create({ data });
    return PrismaToEntity.map(created);
  }

  // Buscas e listagens
  async findById(id: string): Promise<Payment | null> {
    const found = await this.prisma.payment.findUnique({
      where: { id },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByAsaasCheckout(asaasCheckoutId: string): Promise<Payment | null> {
    const found = await this.prisma.payment.findFirst({
      where: { asaasCheckoutId },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findAllPaginated(
    eventId: string,
    page: number,
    pageSize: number,
    filter?: { accountId?: string; status?: StatusPayment[] },
  ): Promise<Payment[]> {
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClauseEvent(filter);
    const found = await this.prisma.payment.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      where: {
        eventId,
        ...where,
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async findAllByInscriptionIdPaginated(
    inscriptionId: string,
    page: number,
    pageSize: number,
  ): Promise<Payment[]> {
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.payment.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      where: {
        allocations: {
          some: {
            inscriptionId,
          },
        },
      },
    });
    return found.map(PrismaToEntity.map);
  }

  // Agregações e contagens
  async countAllFiltered(
    eventId: string,
    filters: {
      accountId?: string;
      status?: StatusPayment[];
    },
  ): Promise<number> {
    const where = this.buildWhereClauseEvent(filters);
    const count = await this.prisma.payment.count({
      where: {
        eventId,
        ...where,
      },
    });
    return count;
  }

  async countParticipantByInscriptionId(
    inscriptionId: string,
  ): Promise<number> {
    return this.prisma.payment.count({
      where: {
        allocations: {
          some: {
            inscriptionId,
          },
        },
      },
    });
  }

  private buildWhereClauseEvent(filter?: {
    accountId?: string;
    status?: StatusPayment[];
  }) {
    const { accountId, status } = filter || {};

    return {
      accountId,
      status: status && status.length > 0 ? { in: status } : undefined,
    };
  }

  async countAllOrdered(
    accountId: string,
    eventId: string,
  ): Promise<PaymentsSummary> {
    const count = await this.prisma.payment.groupBy({
      by: ['status'],
      where: {
        eventId,
        accountId,
      },
      _count: {
        _all: true,
      },
      _sum: {
        totalValue: true,
      },
    });

    return {
      totalPayments: count.reduce((acc, g) => acc + g._count._all, 0),
      totalPaidValue: Number(
        count.find((g) => g.status === StatusPayment.APPROVED)?._sum
          .totalValue ?? 0,
      ),
      totalUnderReviewValue: Number(
        count.find((g) => g.status === StatusPayment.UNDER_REVIEW)?._sum
          .totalValue ?? 0,
      ),
      totalRefusedValue: Number(
        count.find((g) => g.status === StatusPayment.REFUSED)?._sum
          .totalValue ?? 0,
      ),
    };
  }

  async countTotalPaid(
    accountId: string,
    eventId: string,
    filter: {
      limitTime?: string;
    },
  ): Promise<number> {
    const where = this.buildWhereClause(filter);
    const result = await this.prisma.payment.aggregate({
      where: {
        accountId,
        eventId,
        status: StatusPayment.APPROVED,
        ...where,
      },
      _sum: {
        totalValue: true,
      },
    });

    return Number(result._sum.totalValue ?? 0);
  }

  async countTotalDue(
    accountId: string,
    eventId: string,
    filter: { limitTime?: string },
  ): Promise<number> {
    const where = this.buildWhereClause(filter);
    const result = await this.prisma.payment.aggregate({
      where: {
        accountId,
        eventId,
        status: {
          in: [StatusPayment.UNDER_REVIEW],
        },
        ...where,
      },
      _sum: {
        totalValue: true,
      },
    });
    console.log(result);

    return Number(result._sum.totalValue ?? 0);
  }

  async countAllByEventId(eventId: string): Promise<number> {
    const count = await this.prisma.payment.count({
      where: {
        eventId,
      },
    });

    return count;
  }

  async countAllInAnalysis(eventId: string): Promise<number> {
    const count = await this.prisma.payment.count({
      where: {
        eventId,
        status: StatusPayment.UNDER_REVIEW,
      },
    });

    return count;
  }

  async countTotalAmountInAnalysis(eventId: string): Promise<number> {
    const count = await this.prisma.payment.aggregate({
      where: {
        eventId,
        status: StatusPayment.UNDER_REVIEW,
      },
      _sum: {
        totalValue: true,
      },
    });

    return Number(count._sum.totalValue ?? 0);
  }

  // Atualizações
  async update(payment: Payment): Promise<Payment> {
    const data = EntityToPrisma.map(payment);
    const updated = await this.prisma.payment.update({
      where: { id: payment.getId() },
      data,
    });
    return PrismaToEntity.map(updated);
  }

  // Deletes
  async delete(id: string): Promise<void> {
    await this.prisma.payment.delete({
      where: { id },
    });
  }

  // Métodos privados
  private buildWhereClause(filters: { limitTime?: string }) {
    const { limitTime } = filters || {};

    return {
      limitTime,
    };
  }
}
