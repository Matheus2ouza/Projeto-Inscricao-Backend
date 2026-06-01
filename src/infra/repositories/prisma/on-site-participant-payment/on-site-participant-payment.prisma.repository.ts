import { Injectable } from '@nestjs/common';
import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import { OnSiteParticipantPaymentGateway } from 'src/domain/repositories/on-site-participant-payment.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { OnSiteParticipantPaymentEntityToOnSiteParticipantPaymentPrismaModelMapper as EntityToPrisma } from './model/mappers/on-site-participant-payment-entity-to-on-site-participant-payment-prisma-model.mapper';
import { OnSiteParticipantPaymentPrismaModelToOnSiteParticipantPaymentEntityMapper as PrismaToEntity } from './model/mappers/on-site-participant-payment-prisma-model-to-on-site-participant-payment-entity.mapper';

@Injectable()
export class OnSiteParticipantPaymentPrismaRepository
  implements OnSiteParticipantPaymentGateway
{
  public constructor(private readonly prisma: PrismaService) {}

  public async create(
    payment: OnSiteParticipantPayment,
  ): Promise<OnSiteParticipantPayment> {
    const data = EntityToPrisma.map(payment);

    const created = await this.prisma.onSiteParticipantPayment.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  async createManyTx(
    payment: OnSiteParticipantPayment[],
    tx: PrismaTransactionClient,
  ): Promise<number> {
    const data = payment.map(EntityToPrisma.map);
    const created = await tx.onSiteParticipantPayment.createMany({
      data,
      skipDuplicates: true,
    });

    return created.count;
  }

  async upsert(
    payment: OnSiteParticipantPayment,
  ): Promise<OnSiteParticipantPayment> {
    const data = EntityToPrisma.map(payment);
    const created = await this.prisma.onSiteParticipantPayment.upsert({
      where: { id: payment.getId() },
      update: data,
      create: data,
    });

    return PrismaToEntity.map(created);
  }

  public async findById(id: string): Promise<OnSiteParticipantPayment | null> {
    const aModel = await this.prisma.onSiteParticipantPayment.findUnique({
      where: { id },
    });

    return aModel ? PrismaToEntity.map(aModel) : null;
  }

  public async findByParticipantId(
    participantId: string,
  ): Promise<OnSiteParticipantPayment[]> {
    const models = await this.prisma.onSiteParticipantPayment.findMany({
      where: { participantId },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(PrismaToEntity.map);
  }

  async findManyByOnSiteParticipantsPayment(
    id: string,
  ): Promise<OnSiteParticipantPayment[]> {
    const found = await this.prisma.onSiteParticipantPayment.findMany({
      where: {
        participantId: id,
      },
    });

    return found.map(PrismaToEntity.map);
  }
}
