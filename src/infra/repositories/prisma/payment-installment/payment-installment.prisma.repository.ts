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

  async update(
    paymentInstallment: PaymentInstallment,
  ): Promise<PaymentInstallment> {
    const data = EntityToPrisma.map(paymentInstallment);
    const updated = await this.prisma.paymentInstallment.update({
      where: { id: paymentInstallment.getId() },
      data,
    });

    return PrismaToEntity.map(updated);
  }

  // Deletar as parcelas de um pagamento pelo ID do pagamento
  async deleteMany(paymentId: string): Promise<void> {
    await this.prisma.paymentInstallment.deleteMany({
      where: { paymentId },
    });
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
