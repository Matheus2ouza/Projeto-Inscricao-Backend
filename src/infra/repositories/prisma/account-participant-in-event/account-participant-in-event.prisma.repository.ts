import { Injectable } from '@nestjs/common';
import { AccountParticipantInEvent } from 'src/domain/entities/account-participant-in-event.entity';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { PrismaService } from '../prisma.service';
import { AccountParticipantInEventEntityToAccountParticipantInEventPrismaModelMapper as EntityToPrisma } from './model/mappers/account-participant-in-event-entity-to-account-participant-in-event-prisma-model.mapper';
import { AccountParticipantInEventPrismaModelToAccountParticipantInEventEntityMapper as PrismaToEntity } from './model/mappers/account-participant-in-event-prisma-model-to-account-participant-in-event-entity.mapper';

@Injectable()
export class AccountParticipantInEventPrismaRepository
  implements AccountParticipantInEventGateway
{
  constructor(private prismaService: PrismaService) {}

  // CRUD básico
  async create(
    accountParticipant: AccountParticipantInEvent,
  ): Promise<AccountParticipantInEvent> {
    const data = EntityToPrisma.map(accountParticipant);
    const accountParticipantInEvent =
      await this.prismaService.accountParticipantInEvent.create({
        data,
      });
    return PrismaToEntity.map(accountParticipantInEvent);
  }

  // Buscas e listagens
  async findByParticipantAndEvent(
    accountParticipantId: string,
    eventId: string,
  ): Promise<AccountParticipantInEvent | null> {
    const accountParticipantInEvent =
      await this.prismaService.accountParticipantInEvent.findFirst({
        where: {
          accountParticipantId,
          inscription: {
            eventId,
          },
        },
      });
    if (!accountParticipantInEvent) return null;
    return PrismaToEntity.map(accountParticipantInEvent);
  }
}
