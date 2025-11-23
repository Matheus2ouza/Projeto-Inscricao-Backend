import { Injectable } from '@nestjs/common';
import { TicketSalePayment } from 'src/domain/entities/ticket-sale-payment.entity';
import { TicketSalePaymentGateway } from 'src/domain/repositories/ticket-sale-payment.geteway';
import { PrismaService } from '../prisma.service';
import { TicketSalePaymentToEntityToTicketSalePaymentPrismaModelMapper as EntityToPrisma } from './model/mapper/ticket-sale-payment-to-entity-to-ticket-sale-payment-prisma-model.mapper';
import { TicketSalePaymentToPrismaModelToTicketSalePaymentEntityMapper as PrismaToEntity } from './model/mapper/ticket-sale-payment-to-prisma-model-to-ticket-sale-payment-entity.mapper';

@Injectable()
export class TicketSalePaymentPrismaRepository
  implements TicketSalePaymentGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    ticketSalePayment: TicketSalePayment,
  ): Promise<TicketSalePayment> {
    const data = EntityToPrisma.map(ticketSalePayment);

    const created = await this.prisma.ticketSalePayment.create({
      data,
    });

    return PrismaToEntity.map(created);
  }
}
