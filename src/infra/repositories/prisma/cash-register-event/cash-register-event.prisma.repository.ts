import { Injectable } from '@nestjs/common';
import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { PrismaService, PrismaTransactionClient } from '../prisma.service';
import { CashRegisterEventEntityToCashRegisterEventPrismaModelMapper as EntityToPrisma } from './model/mapper/cash-register-event-entity-to-cash-register-event-prisma-model.mapper';
import { CashRegisterEventPrismaModelToCashRegisterEventEntityMapper as PrismaToEntity } from './model/mapper/cash-register-event-prisma-model-to-cash-register-event-entity.mapper';

@Injectable()
export class CashRegisterEventPrismaRepository
  implements CashRegisterEventGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    cashRegisterEvent: CashRegisterEvent,
  ): Promise<CashRegisterEvent> {
    const data = EntityToPrisma.map(cashRegisterEvent);
    const created = await this.prisma.cashRegisterEvent.create({ data });
    return PrismaToEntity.map(created);
  }

  async createTx(
    cashRegisterEvent: CashRegisterEvent,
    tx: PrismaTransactionClient,
  ): Promise<CashRegisterEvent> {
    const data = EntityToPrisma.map(cashRegisterEvent);
    const created = await tx.cashRegisterEvent.create({ data });
    return PrismaToEntity.map(created);
  }

  async findByEventId(eventId: string): Promise<CashRegisterEvent[]> {
    const found = await this.prisma.cashRegisterEvent.findMany({
      where: {
        eventId,
      },
    });

    return found.map(PrismaToEntity.map);
  }
}
