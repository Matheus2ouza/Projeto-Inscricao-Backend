import { Injectable } from '@nestjs/common';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentAllocationEntityToPaymentAllocationPrismaModel as EntityToPrisma } from 'src/infra/repositories/prisma/payment-allocation/model/mappers/payment-allocation-entity-to-payment-allocation-prisma-model.mapper';
import { PaymentAllocationPrismaModelToPaymentAllocationEntity as PrismaToEntity } from 'src/infra/repositories/prisma/payment-allocation/model/mappers/payment-allocation-prisma-model-to-payment-allocation-entity.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentAllocationPrismaRepository
  implements PaymentAllocationGateway
{
  constructor(private readonly prisma: PrismaService) {}

  // CRUD básico
  async create(payment: PaymentAllocation): Promise<PaymentAllocation> {
    const data = EntityToPrisma.map(payment);
    const created = await this.prisma.paymentAllocation.create({ data });
    return PrismaToEntity.map(created);
  }

  async createMany(payments: PaymentAllocation[]): Promise<void> {
    const data = payments.map(EntityToPrisma.map);
    await this.prisma.paymentAllocation.createMany({ data });
  }

  // Buscas e listagens
  async findByPaymentId(paymentId: string): Promise<PaymentAllocation[]> {
    const found = await this.prisma.paymentAllocation.findMany({
      where: {
        paymentId,
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async findbyInscriptionId(
    inscriptionId: string,
  ): Promise<PaymentAllocation[]> {
    const found = await this.prisma.paymentAllocation.findMany({
      where: {
        inscriptionId,
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async sumPaidValueByInscription(inscriptionId: string): Promise<number> {
    const result = await this.prisma.paymentAllocation.aggregate({
      where: {
        inscriptionId,
        payment: {
          status: {
            in: ['UNDER_REVIEW', 'APPROVED'],
          },
        },
      },
      _sum: {
        value: true,
      },
    });

    return Number(result._sum.value) ?? 0;
  }
}
