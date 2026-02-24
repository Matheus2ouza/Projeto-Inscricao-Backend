import { Injectable } from '@nestjs/common';
import { PaymentLink } from 'src/domain/entities/payment-link.entity';
import { PaymentLinkGateway } from 'src/domain/repositories/payment-link.gateway';
import { PaymentLinktEntityToPaymenLinkPrismaModelMapper as EntityToPrisma } from 'src/infra/repositories/prisma/payment-link/model/mappers/payment-link-entity-to-payment-link-prisma-model.mapper';
import { PaymentLinkPrismaModelToPaymentLinkEntityMapper as PrismaToEntity } from 'src/infra/repositories/prisma/payment-link/model/mappers/payment-link-prisma-model-to-payment-link-entity.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentLinkPrismaRepository implements PaymentLinkGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(paymentLink: PaymentLink): Promise<PaymentLink> {
    const data = EntityToPrisma.map(paymentLink);
    const created = await this.prisma.paymentLink.create({ data });
    return PrismaToEntity.map(created);
  }

  async findById(id: string): Promise<PaymentLink | null> {
    const found = await this.prisma.paymentLink.findUnique({
      where: {
        id,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }

  async findByPaymentId(paymentId: string): Promise<PaymentLink | null> {
    const found = await this.prisma.paymentLink.findFirst({
      where: {
        payments: {
          some: {
            id: paymentId,
          },
        },
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }
}
