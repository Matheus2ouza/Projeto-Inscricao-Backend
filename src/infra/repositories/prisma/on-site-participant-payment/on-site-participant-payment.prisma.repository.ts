import { Injectable } from '@nestjs/common';
import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import { OnSiteParticipantPaymentGateway } from 'src/domain/repositories/on-site-participant-payment.gateway';
import { PrismaService } from '../prisma.service';
import { OnSiteParticipantPaymentEntityToOnSiteParticipantPaymentPrismaModelMapper as PrismaToEntity } from './model/mappers/on-site-participant-payment-entity-to-on-site-participant-payment-prisma-model.mapper';
import { OnSiteParticipantPaymentPrismaModelToOnSiteParticipantPaymentEntityMapper as EntityToPrisma } from './model/mappers/on-site-participant-payment-prisma-model-to-on-site-participant-payment-entity.mapper';

@Injectable()
export class OnSiteParticipantPaymentPrismaRepository
  implements OnSiteParticipantPaymentGateway
{
  public constructor(private readonly prisma: PrismaService) {}

  public async create(
    payment: OnSiteParticipantPayment,
  ): Promise<OnSiteParticipantPayment> {
    const data = PrismaToEntity.map(payment);

    const created = await this.prisma.onSiteParticipantPayment.create({
      data,
    });

    return EntityToPrisma.map(created);
  }

  public async findById(id: string): Promise<OnSiteParticipantPayment | null> {
    const aModel = await this.prisma.onSiteParticipantPayment.findUnique({
      where: { id },
    });

    return aModel ? EntityToPrisma.map(aModel) : null;
  }

  public async findByParticipantId(
    participantId: string,
  ): Promise<OnSiteParticipantPayment[]> {
    const models = await this.prisma.onSiteParticipantPayment.findMany({
      where: { participantId },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(EntityToPrisma.map);
  }

  async findManyByOnSiteParticipantsPayment(
    id: string,
  ): Promise<OnSiteParticipantPayment[]> {
    const found = await this.prisma.onSiteParticipantPayment.findMany({
      where: {
        participantId: id,
      },
    });

    return found.map(EntityToPrisma.map);
  }
}
