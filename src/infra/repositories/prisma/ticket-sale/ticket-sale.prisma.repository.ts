import { Injectable } from '@nestjs/common';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { PrismaService } from '../prisma.service';
import { TicketSaleToEntityToTicketSalePrismaModelMapper as EntityToPrisma } from './model/mappers/ticket-sale-to-entity-to-ticket-sale-prisma-model.mapper';
import { TicketSaleToPrismaModelToTicketSaleEntityMapper as PrismaToEntity } from './model/mappers/ticket-sale-to-prisma-model-to-ticket-sale-entity.mapper';

@Injectable()
export class TicketSalePrismaRepository implements TicketSaleGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(ticketSale: TicketSale): Promise<TicketSale> {
    const data = EntityToPrisma.map(ticketSale);
    const created = await this.prisma.ticketSale.create({ data });
    return PrismaToEntity.map(created);
  }

  async findByEventTicketId(ticketId: string): Promise<TicketSale[]> {
    const data = await this.prisma.ticketSale.findMany({
      where: { ticketId: ticketId },
    });

    return data.map(PrismaToEntity.map);
  }

  async findByEventId(eventId: string): Promise<TicketSale[]> {
    const data = await this.prisma.ticketSale.findMany({
      where: {
        ticket: {
          eventId: eventId,
        },
      },
    });

    return data.map(PrismaToEntity.map);
  }

  async getEventSalesSummary(eventId: string): Promise<{
    quantityTicketSale: number;
    totalSalesValue: number;
  }> {
    const result = await this.prisma.ticketSale.aggregate({
      where: {
        ticket: { eventId },
      },
      _sum: {
        quantity: true,
        totalValue: true,
      },
    });

    return {
      quantityTicketSale: result._sum.quantity ?? 0,
      totalSalesValue: Number(result._sum.totalValue ?? 0),
    };
  }
}
