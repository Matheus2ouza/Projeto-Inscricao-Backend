import { Injectable } from '@nestjs/common';
import { PaymentMethod } from 'generated/prisma';
import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import {
  OnSiteRegistrationGateway,
  OnSiteRegistrationPaymentTotals,
} from 'src/domain/repositories/on-site-registration.gateway';
import { OnSiteParticipantPaymentEntityToOnSiteParticipantPaymentPrismaModelMapper } from '../on-site-participant-payment/model/mappers/on-site-participant-payment-entity-to-on-site-participant-payment-prisma-model.mapper';
import { OnSiteParticipantEntityToOnSiteParticipantPrismaModelMapper } from '../on-site-participant/model/mappers/on-site-participant-entity-to-on-site-participant-prisma-model.mapper';
import { PrismaService } from '../prisma.service';
import { OnSiteRegistrationEntityToOnSiteRegistrationPrismaModelMapper } from './model/mappers/on-site-registration-entity-to-on-site-registration-prisma-model.mapper';
import { OnSiteRegistrationPrismaModelToOnSiteRegistrationEntityMapper } from './model/mappers/on-site-registration-prisma-model-to-on-site-registration-entity.mapper';

@Injectable()
export class OnSiteRegistrationPrismaRepository
  implements OnSiteRegistrationGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    onSiteRegistration: OnSiteRegistration,
  ): Promise<OnSiteRegistration> {
    const data =
      OnSiteRegistrationEntityToOnSiteRegistrationPrismaModelMapper.map(
        onSiteRegistration,
      );
    const created = await this.prisma.onSiteRegistration.create({ data });
    return OnSiteRegistrationPrismaModelToOnSiteRegistrationEntityMapper.map(
      created,
    );
  }

  async createWithParticipantsAndPayments(
    onSiteRegistration: OnSiteRegistration,
    participants: OnSiteParticipant[],
    payments: OnSiteParticipantPayment[],
  ): Promise<OnSiteRegistration> {
    const registrationData =
      OnSiteRegistrationEntityToOnSiteRegistrationPrismaModelMapper.map(
        onSiteRegistration,
      );
    const participantsData = participants.map((participant) =>
      OnSiteParticipantEntityToOnSiteParticipantPrismaModelMapper.map(
        participant,
      ),
    );
    const paymentsData = payments.map((payment) =>
      OnSiteParticipantPaymentEntityToOnSiteParticipantPaymentPrismaModelMapper.map(
        payment,
      ),
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const createdRegistration = await tx.onSiteRegistration.create({
        data: registrationData,
      });

      if (participantsData.length > 0) {
        await tx.onSiteParticipant.createMany({
          data: participantsData,
        });
      }

      if (paymentsData.length > 0) {
        await tx.onSiteParticipantPayment.createMany({
          data: paymentsData,
        });
      }

      return createdRegistration;
    });

    return OnSiteRegistrationPrismaModelToOnSiteRegistrationEntityMapper.map(
      created,
    );
  }

  async findMany(eventId: string): Promise<OnSiteRegistration[]> {
    const aModel = await this.prisma.onSiteRegistration.findMany({
      where: { eventId },
    });

    return aModel.map(
      OnSiteRegistrationPrismaModelToOnSiteRegistrationEntityMapper.map,
    );
  }

  async findManyPaginated(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<OnSiteRegistration[]> {
    const safePage = Math.max(1, Math.floor(page || 1));
    const safePageSize = Math.max(1, Math.min(50, Math.floor(pageSize || 10)));

    const rows = await this.prisma.onSiteRegistration.findMany({
      where: {
        eventId: eventId, // Direct field comparison
      },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    });

    return rows.map((row) =>
      OnSiteRegistrationPrismaModelToOnSiteRegistrationEntityMapper.map(row),
    );
  }

  async countAll(eventId: string): Promise<number> {
    const total = await this.prisma.onSiteRegistration.count({
      where: {
        eventId: eventId, // Direct field comparison
      },
    });
    return total;
  }

  async sumPaymentsByMethod(
    eventId: string,
  ): Promise<OnSiteRegistrationPaymentTotals> {
    const grouped = await this.prisma.onSiteParticipantPayment.groupBy({
      by: ['paymentMethod'],
      _sum: { value: true },
      where: {
        participant: {
          onSiteRegistration: {
            eventId,
          },
        },
      },
    });

    const totals: OnSiteRegistrationPaymentTotals = {
      totalDinheiro: 0,
      totalCartao: 0,
      totalPix: 0,
      totalGeral: 0,
    };

    grouped.forEach((row) => {
      const amount = Number(row._sum.value ?? 0);

      switch (row.paymentMethod) {
        case PaymentMethod.DINHEIRO:
          totals.totalDinheiro = amount;
          break;
        case PaymentMethod.CARTAO:
          totals.totalCartao = amount;
          break;
        case PaymentMethod.PIX:
          totals.totalPix = amount;
          break;
        default:
          break;
      }
    });

    totals.totalGeral =
      totals.totalDinheiro + totals.totalCartao + totals.totalPix;

    return totals;
  }
}
