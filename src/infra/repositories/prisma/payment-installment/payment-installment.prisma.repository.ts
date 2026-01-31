import { Injectable } from '@nestjs/common';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { PaymentInstallmentEntityToPrismaModelMapper as EntityToPrisma } from 'src/infra/repositories/prisma/payment-installment/model/mappers/payment-installment-entity-to-payment-installment-prisma-model.mapper';
import { PaymentInstallmentPrismaModelToEntityMapper as PrismaToEntity } from 'src/infra/repositories/prisma/payment-installment/model/mappers/payment-installment-prisma-model-to-payment-installment-entity.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PaymentInstallmentPrismaRepository
  implements PaymentInstallmentGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    paymentInstallment: PaymentInstallment,
  ): Promise<PaymentInstallment> {
    const data = EntityToPrisma.map(paymentInstallment);
    const created = await this.prisma.paymentInstallment.create({ data });
    return PrismaToEntity.map(created);
  }

  async findById(id: string): Promise<PaymentInstallment | null> {
    const found = await this.prisma.paymentInstallment.findUnique({
      where: { id },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByAsaasPaymentId(
    asaasPaymentId: string,
  ): Promise<PaymentInstallment | null> {
    const found = await this.prisma.paymentInstallment.findUnique({
      where: { asaasPaymentId },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByPaymentId(paymentId: string): Promise<PaymentInstallment[]> {
    const found = await this.prisma.paymentInstallment.findMany({
      where: { paymentId },
    });
    return found.map(PrismaToEntity.map);
  }
}
