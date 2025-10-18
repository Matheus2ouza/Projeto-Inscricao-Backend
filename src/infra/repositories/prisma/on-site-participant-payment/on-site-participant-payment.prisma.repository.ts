import { Injectable } from '@nestjs/common';
import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import { OnSiteParticipantPaymentGateway } from 'src/domain/repositories/on-site-participant-payment.gateway';
import { PrismaService } from '../prisma.service';
import { OnSiteParticipantPaymentEntityToOnSiteParticipantPaymentPrismaModelMapper } from './model/mappers/on-site-participant-payment-entity-to-on-site-participant-payment-prisma-model.mapper';
import { OnSiteParticipantPaymentPrismaModelToOnSiteParticipantPaymentEntityMapper } from './model/mappers/on-site-participant-payment-prisma-model-to-on-site-participant-payment-entity.mapper';

@Injectable()
export class OnSiteParticipantPaymentPrismaRepository
  implements OnSiteParticipantPaymentGateway
{
  public constructor(private readonly prisma: PrismaService) {}

  public async create(
    payment: OnSiteParticipantPayment,
  ): Promise<OnSiteParticipantPayment> {
    const data =
      OnSiteParticipantPaymentEntityToOnSiteParticipantPaymentPrismaModelMapper.map(
        payment,
      );

    const created = await this.prisma.onSiteParticipantPayment.create({
      data,
    });

    return OnSiteParticipantPaymentPrismaModelToOnSiteParticipantPaymentEntityMapper.map(
      created,
    );
  }

  public async findById(
    id: string,
  ): Promise<OnSiteParticipantPayment | null> {
    const aModel = await this.prisma.onSiteParticipantPayment.findUnique({
      where: { id },
    });

    return aModel
      ? OnSiteParticipantPaymentPrismaModelToOnSiteParticipantPaymentEntityMapper.map(
          aModel,
        )
      : null;
  }

  public async findByParticipantId(
    participantId: string,
  ): Promise<OnSiteParticipantPayment[]> {
    const models = await this.prisma.onSiteParticipantPayment.findMany({
      where: { participantId },
      orderBy: { createdAt: 'desc' },
    });

    return models.map(
      OnSiteParticipantPaymentPrismaModelToOnSiteParticipantPaymentEntityMapper.map,
    );
  }
}
