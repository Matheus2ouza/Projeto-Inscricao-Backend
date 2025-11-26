import { Injectable } from '@nestjs/common';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentInscription } from 'src/domain/entities/payment-inscription';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { PrismaService } from '../prisma.service';
import { PaymentInscriptionEntityToPaymentInscriptionPrismaModelMapper } from './model/mapper/payment-inscription-entity-to-payment-inscription-prisma-model.mapper';
import { PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper } from './model/mapper/payment-inscription-prisma-model-to-payment-inscription-entity.mapper';

@Injectable()
export class PaymentInscriptionRepository implements PaymentInscriptionGateway {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD básico
  public async create(
    paymentInscription: PaymentInscription,
  ): Promise<PaymentInscription> {
    const data =
      PaymentInscriptionEntityToPaymentInscriptionPrismaModelMapper.map(
        paymentInscription,
      );
    const created = await this.prisma.paymentInscription.create({ data });
    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      created,
    );
  }

  public async deletePayment(paymentId: string): Promise<void> {
    await this.prisma.paymentInscription.delete({
      where: { id: paymentId },
    });
  }

  // Buscas por identificador único
  public async findById(id: string): Promise<PaymentInscription | null> {
    const aModel = await this.prisma.paymentInscription.findUnique({
      where: { id },
    });

    return aModel
      ? PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
          aModel,
        )
      : null;
  }

  // Buscas por relacionamento
  public async findbyInscriptionId(id: string): Promise<PaymentInscription[]> {
    const aModel = await this.prisma.paymentInscription.findMany({
      where: { inscriptionId: id },
    });

    return aModel.map(
      PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map,
    );
  }

  public async findToAnalysis(
    id: string,
    filters: {
      status?: string[];
      page: number;
      pageSize: number;
    },
  ): Promise<PaymentInscription[]> {
    const { page, pageSize, ...filterFields } = filters;
    const where = this.buildWhereClause({
      inscriptionId: id,
      ...filterFields,
    });
    const skip = (page - 1) * pageSize;

    const aModel = await this.prisma.paymentInscription.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    return aModel.map(
      PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map,
    );
  }

  // Agregações e contagens
  async countAllFiltered(filters: {
    inscriptionId: string;
    status?: string[];
  }): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.paymentInscription.count({ where });
  }

  public async countAllByEvent(eventId: string): Promise<number> {
    const total = await this.prisma.paymentInscription.count({
      where: { eventId },
    });

    return total;
  }

  public async countAllInAnalysis(eventId: string): Promise<number> {
    const total = await this.prisma.paymentInscription.count({
      where: { eventId, status: 'UNDER_REVIEW' },
    });

    return total;
  }

  public async countAllByInscriptionId(inscriptionId: string): Promise<number> {
    const total = await this.prisma.paymentInscription.count({
      where: { inscriptionId },
    });
    return total;
  }

  // Atualizações de status
  public async approvedPayment(id: string): Promise<PaymentInscription> {
    const data = await this.prisma.paymentInscription.update({
      where: { id },
      data: {
        status: 'APPROVED',
      },
    });

    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      data,
    );
  }

  public async approvePaymentWithTransaction(
    paymentId: string,
  ): Promise<PaymentInscription> {
    const payment = await this.findById(paymentId);

    if (!payment) {
      throw new Error(`Payment with id ${paymentId} not found`);
    }

    const movement = FinancialMovement.create({
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      type: 'INCOME',
      value: payment.getValue(),
    });

    const result = await this.prisma.$transaction(async (tx) => {
      const inscription = await tx.inscription.update({
        where: { id: payment.getInscriptionId() },
        data: { totalValue: { decrement: Number(payment.getValue()) } },
        select: { totalValue: true },
      });

      await tx.financialMovement.create({
        data: {
          id: movement.getId(),
          eventId: movement.getEventId(),
          accountId: movement.getAccountId(),
          type: movement.getType(),
          value: movement.getValue(),
          createdAt: movement.getCreatedAt(),
          updatedAt: movement.getUpdatedAt(),
        },
      });

      await tx.events.update({
        where: { id: payment.getEventId() },
        data: { amountCollected: { increment: Number(payment.getValue()) } },
      });

      if (Math.abs(Number(inscription.totalValue)) < 0.01) {
        await tx.inscription.update({
          where: { id: payment.getInscriptionId() },
          data: { status: 'PAID' },
        });
      }

      const approvedPayment = await tx.paymentInscription.update({
        where: { id: paymentId },
        data: { status: 'APPROVED', financialMovementId: movement.getId() },
      });

      return approvedPayment;
    });

    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      result,
    );
  }

  public async rejectedPayment(
    paymentId: string,
    rejectionReason?: string,
  ): Promise<PaymentInscription> {
    const payment = await this.prisma.paymentInscription.update({
      where: { id: paymentId },
      data: {
        status: 'REFUSED',
        rejectionReason: rejectionReason,
      },
    });
    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      payment,
    );
  }

  public async revertApprovedPayment(
    paymentId: string,
  ): Promise<PaymentInscription> {
    const payment = await this.findById(paymentId);

    if (!payment) {
      throw new Error(`Payment with id ${paymentId} not found`);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const inscription = await tx.inscription.update({
        where: { id: payment.getInscriptionId() },
        data: { totalValue: { increment: Number(payment.getValue()) } },
        select: {
          status: true,
        },
      });

      if (payment.getFinancialMovementId()) {
        await tx.financialMovement.delete({
          where: { id: payment.getFinancialMovementId() },
        });
      }

      await tx.events.update({
        where: { id: payment.getEventId() },
        data: { amountCollected: { decrement: Number(payment.getValue()) } },
      });

      if (inscription.status === 'PAID') {
        await tx.inscription.update({
          where: { id: payment.getInscriptionId() },
          data: { status: 'PENDING' },
        });
      }

      const approvedPayment = await tx.paymentInscription.update({
        where: { id: paymentId },
        data: { status: 'UNDER_REVIEW' },
      });

      return approvedPayment;
    });
    return PaymentInscriptionPrismaModelToPaymentInscriptionEntityMapper.map(
      result,
    );
  }

  // Métodos privados
  private buildWhereClause(filters: {
    inscriptionId: string;
    status?: string[];
  }) {
    const where: any = {
      inscriptionId: filters.inscriptionId,
    };

    if (filters.status && filters.status.length > 0) {
      where.status = {
        in: filters.status,
      };
    }

    return where;
  }

  async sumPaidByAccountIdAndEventId(
    accountId: string,
    eventId: string,
  ): Promise<number> {
    const sum = await this.prisma.paymentInscription.aggregate({
      where: {
        accountId,
        eventId,
        status: 'APPROVED',
      },
      _sum: {
        value: true,
      },
    });
    return Number(sum._sum.value || 0);
  }
}
