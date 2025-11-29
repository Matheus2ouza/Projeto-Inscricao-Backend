import { Injectable } from '@nestjs/common';
import { TicketSaleStatus } from 'generated/prisma';
import { TicketSale } from 'src/domain/entities/ticket-sale.entity';
import { TicketSaleGateway } from 'src/domain/repositories/ticket-sale.gateway';
import { Utils } from 'src/shared/utils/utils';
import { PrismaService } from '../prisma.service';
import { TicketSaleToEntityToTicketSalePrismaModelMapper as EntityToPrisma } from './model/mappers/ticket-sale-to-entity-to-ticket-sale-prisma-model.mapper';
import { TicketSaleToPrismaModelToTicketSaleEntityMapper as PrismaToEntity } from './model/mappers/ticket-sale-to-prisma-model-to-ticket-sale-entity.mapper';

@Injectable()
export class TicketSalePrismaRepository implements TicketSaleGateway {
  constructor(private readonly prisma: PrismaService) {}

  // CRUD básico
  async create(ticketSale: TicketSale): Promise<TicketSale> {
    const data = EntityToPrisma.map(ticketSale);
    const created = await this.prisma.ticketSale.create({ data });
    return PrismaToEntity.map(created);
  }

  // Buscas e listagens
  async findById(ticketSaleId: string): Promise<TicketSale | null> {
    const data = await this.prisma.ticketSale.findUnique({
      where: {
        id: ticketSaleId,
      },
    });
    return data ? PrismaToEntity.map(data) : null;
  }

  async findByEventId(eventId: string): Promise<TicketSale[]> {
    const data = await this.prisma.ticketSale.findMany({
      where: {
        eventId,
      },
    });
    return data.map(PrismaToEntity.map);
  }

  async findByEventIdWithPagination(
    page: number,
    pageSize: number,
    filter?: {
      eventId?: string;
      status?: TicketSaleStatus[];
    },
  ): Promise<TicketSale[]> {
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClauseEvent(filter);
    const data = await this.prisma.ticketSale.findMany({
      where,
      skip,
      take: pageSize,
    });
    return data.map(PrismaToEntity.map);
  }

  private buildWhereClauseEvent(filter?: {
    eventId?: string;
    status?: TicketSaleStatus[];
  }) {
    const { eventId, status } = filter || {};
    return {
      eventId,
      status: status ? { in: status } : undefined,
    };
  }

  // Agregações e contagens
  async countSalesByEventId(eventId: string): Promise<number> {
    return this.prisma.ticketSale.count({
      where: {
        eventId,
      },
    });
  }

  async getEventSalesSummary(eventId: string): Promise<{
    quantityTicketSale: number;
    totalSalesValue: number;
  }> {
    const data = await this.prisma.ticketSale.aggregate({
      where: {
        eventId,
        status: 'PAID',
      },
      _sum: {
        totalValue: true,
      },
      _count: {
        id: true,
      },
    });
    return {
      quantityTicketSale: data._count.id || 0,
      totalSalesValue: Number(data._sum.totalValue || 0),
    };
  }

  async countByEventIdAndStatus(
    eventId: string,
    status: TicketSaleStatus[],
  ): Promise<number> {
    const count = await this.prisma.ticketSale.count({
      where: { eventId, status: { in: status } },
    });

    return Number(count);
  }

  // Atualizações de Status
  async approvePreSale(
    ticketSaleId: string,
    status: TicketSaleStatus,
    updatedAt: Date,
  ): Promise<TicketSale> {
    const data = await this.prisma.$transaction((tx) =>
      tx.ticketSale.update({
        where: {
          id: ticketSaleId,
        },
        data: {
          status,
          updatedAt,
        },
      }),
    );
    return PrismaToEntity.map(data);
  }

  async approvePreSaleAtomic(
    ticketSaleId: string,
    accountId: string,
    totalValue: number,
  ): Promise<{ sale: any; items: any[]; ticketUnits: any[] }> {
    return this.prisma.$transaction(async (tx) => {
      // Buscar venda
      const sale = await tx.ticketSale.findUnique({
        where: { id: ticketSaleId },
      });

      if (!sale) throw new Error('TicketSale não encontrada');

      // Criar movimento financeiro
      const financial = await tx.financialMovement.create({
        data: {
          eventId: sale.eventId,
          accountId,
          type: 'INCOME',
          value: totalValue,
        },
      });

      // Atualizar pagamento
      await tx.ticketSalePayment.updateMany({
        where: { ticketSaleId: sale.id },
        data: {
          financialMovementId: financial.id,
        },
      });

      // Atualizar status da venda
      const updatedSale = await tx.ticketSale.update({
        where: { id: sale.id },
        data: {
          status: 'PAID',
          approvedBy: accountId,
          updatedAt: new Date(),
        },
      });

      // Buscar itens da venda
      const items = await tx.ticketSaleItem.findMany({
        where: { ticketSaleId: sale.id },
      });

      // Criar unidades + descontar estoque
      const ticketUnits: any[] = [];

      for (const item of items) {
        // Criar as unidades
        for (let i = 0; i < item.quantity; i++) {
          const unit = await tx.ticketUnit.create({
            data: {
              ticketSaleItemId: item.id,
              qrCode: Utils.generateUUID(),
            },
          });

          ticketUnits.push(unit);
        }

        // DESCONTAR O ESTOQUE
        await tx.eventTickets.update({
          where: { id: item.ticketId },
          data: {
            available: {
              decrement: item.quantity,
            },
          },
        });
      }

      return {
        sale: updatedSale,
        items,
        ticketUnits,
      };
    });
  }

  async rejectPreSale(
    ticketSaleId: string,
    status: TicketSaleStatus,
    updatedAt: Date,
  ): Promise<TicketSale> {
    const data = await this.prisma.$transaction((tx) =>
      tx.ticketSale.update({
        where: {
          id: ticketSaleId,
        },
        data: {
          status,
          updatedAt,
        },
      }),
    );
    return PrismaToEntity.map(data);
  }
}
