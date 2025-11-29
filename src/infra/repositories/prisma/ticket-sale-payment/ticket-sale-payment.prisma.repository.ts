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

  // CRUD básico
  async create(
    ticketSalePayment: TicketSalePayment,
  ): Promise<TicketSalePayment> {
    const data = EntityToPrisma.map(ticketSalePayment);

    const created = await this.prisma.ticketSalePayment.create({
      data,
    });

    return PrismaToEntity.map(created);
  }

  // Atualizações
  async update(
    ticketSalePayment: TicketSalePayment,
  ): Promise<TicketSalePayment> {
    const data = EntityToPrisma.map(ticketSalePayment);

    const updated = await this.prisma.ticketSalePayment.update({
      where: {
        id: ticketSalePayment.getId(),
      },
      data,
    });

    return PrismaToEntity.map(updated);
  }

  // Buscas e listagens
  async findById(id: string): Promise<TicketSalePayment | null> {
    const found = await this.prisma.ticketSalePayment.findUnique({
      where: {
        id,
      },
    });

    return found ? PrismaToEntity.map(found) : null;
  }

  async findByTicketSaleId(ticketSaleId: string): Promise<TicketSalePayment[]> {
    const found = await this.prisma.ticketSalePayment.findMany({
      where: {
        ticketSaleId,
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async deleteByTicketSaleIds(ticketSaleIds: string[]): Promise<number> {
    if (!ticketSaleIds.length) {
      return 0;
    }

    const result = await this.prisma.ticketSalePayment.deleteMany({
      where: {
        ticketSaleId: {
          in: ticketSaleIds,
        },
      },
    });

    return result.count;
  }
}
