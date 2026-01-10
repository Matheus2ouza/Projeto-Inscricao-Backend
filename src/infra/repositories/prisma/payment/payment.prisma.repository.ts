import { Injectable } from '@nestjs/common';
import { Payment } from 'src/domain/entities/payment.entity';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { PaymentEntityToPaymentPrismaModelMapper as EntityToPrisma } from 'src/infra/repositories/prisma/payment/model/mappers/payment-entity-to-payment-prisma-model.mapper';
import { PaymentPrismaModelToPaymentEntityMapper as PrismaToEntity } from 'src/infra/repositories/prisma/payment/model/mappers/payment-prisma-model-to-payment-entity.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentPrismaRepository implements PaymentGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(payment: Payment): Promise<Payment> {
    const data = EntityToPrisma.map(payment);
    const created = await this.prisma.payment.create({ data });
    return PrismaToEntity.map(created);
  }
}
