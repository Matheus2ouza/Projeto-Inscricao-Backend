import { Injectable } from '@nestjs/common';
import { TicketUnit } from 'src/domain/entities/ticket-unit.entity';
import { TicketUnitGateway } from 'src/domain/repositories/ticket-unit.gatewat';
import { PrismaService } from '../prisma.service';
import { TicketUnitToEntityToTicketUnitPrismaModelMapper as EntityToPrisma } from './model/mapper/ticket-unit-to-entity-to-ticket-unit-to-prisma-model.mapper';
import { TicketUnitToPrismaModelToTicketUnitEntityMapper as PrismaToEntity } from './model/mapper/ticket-unit-to-prisma-model-to-ticket-unit-to-entity.mapper';

@Injectable()
export class TicketUnitPrismaRepository implements TicketUnitGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(ticketUnit: TicketUnit): Promise<TicketUnit> {
    const data = EntityToPrisma.map(ticketUnit);
    const created = await this.prisma.ticketUnit.create({
      data,
    });
    return PrismaToEntity.map(created);
  }
}
