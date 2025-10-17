import { Injectable } from '@nestjs/common';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { PrismaService } from '../prisma.service';
import { TicketSaleToEntityToTicketSalePrismaModelMapper } from './model/mappers/ticket-sale-to-entity-to-ticket-sale-prisma-model.mapper';
import { TicketSaleToPrismaModelToTicketSaleEntityMapper } from './model/mappers/ticket-sale-to-prisma-model-to-ticket-sale-entity.mapper';

@Injectable()
export class TicketSalePrismaRepository implements TicketSaleGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(ticketSale: TicketSale): Promise<TicketSale> {
    const data =
      TicketSaleToEntityToTicketSalePrismaModelMapper.map(ticketSale);
    const created = await this.prisma.ticketSale.create({ data });
    return TicketSaleToPrismaModelToTicketSaleEntityMapper.map(created);
  }

  async findByEventTicketId(ticketId: string): Promise<TicketSale[]> {
    const data = await this.prisma.ticketSale.findMany({
      where: { ticketId: ticketId },
    });

    return data.map(TicketSaleToPrismaModelToTicketSaleEntityMapper.map);
  }
}
