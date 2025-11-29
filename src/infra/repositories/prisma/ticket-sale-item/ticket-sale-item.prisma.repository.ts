import { Injectable } from '@nestjs/common';
import { TicketSaleItem } from 'src/domain/entities/ticket-sale-item.entity';
import { TicketSaleItemGateway } from 'src/domain/repositories/ticket-sale-item.gatewat';
import { PrismaService } from '../prisma.service';
import { TicketSaleItemToEntityToTicketSaleItemPrismaModelMapper as EntityToPrisma } from './model/mappers/ticket-sale-item-to-entity-to-ticket-sale-item-prisma-model.mapper';
import { TicketSaleItemToPrismaModelToTicketSaleItemEntityMapper as PrismaToEntity } from './model/mappers/ticket-sale-item-to-prisma-model-to-ticket-sale-item-entity.mapper';

@Injectable()
export class TicketSaleItemPrismaRepository implements TicketSaleItemGateway {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD básico
  async create(ticketSaleItem: TicketSaleItem): Promise<TicketSaleItem> {
    const data = EntityToPrisma.map(ticketSaleItem);
    const created = await this.prisma.ticketSaleItem.create({ data });
    return PrismaToEntity.map(created);
  }

  // Busca e listagens
  async findByTicketSaleId(ticketSaleId: string): Promise<TicketSaleItem[]> {
    const found = await this.prisma.ticketSaleItem.findMany({
      where: { ticketSaleId },
    });

    return found.map(PrismaToEntity.map);
  }

  // Agregações e contagens
  async countItemsByTicketSaleId(ticketSaleId: string): Promise<number> {
    return this.prisma.ticketSaleItem.count({
      where: {
        ticketSaleId,
      },
    });
  }
}
