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
  constructor(private prisma: PrismaService) {}

  // CRUD básico
  async create(
    accountParticipant: AccountParticipantInEvent,
  ): Promise<AccountParticipantInEvent> {
    const data = EntityToPrisma.map(accountParticipant);
    const accountParticipantInEvent =
      await this.prisma.accountParticipantInEvent.create({
        data,
      });
    return PrismaToEntity.map(accountParticipantInEvent);
  }

  async createMany(
    accountParticipants: AccountParticipantInEvent[],
  ): Promise<void> {
    const data = accountParticipants.map(EntityToPrisma.map);
    await this.prisma.accountParticipantInEvent.createMany({
      data,
    });
  }

  // Buscas e listagens
  async findByParticipantAndEvent(
    accountParticipantId: string,
    eventId: string,
  ): Promise<AccountParticipantInEvent | null> {
    const accountParticipantInEvent =
      await this.prisma.accountParticipantInEvent.findFirst({
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

  async findParticipantDetailsByInscriptionId(inscriptionId: string): Promise<
    {
      participantId: string;
      name: string;
      birthDate: Date;
      gender: import('generated/prisma').genderType;
      typeInscriptionDescription?: string;
    }[]
  > {
    const found = await this.prisma.accountParticipantInEvent.findMany({
      where: { inscriptionId },
      include: {
        participant: true,
        typeInscription: {
          select: { description: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return found.map((item) => ({
      participantId: item.accountParticipantId,
      name: item.participant.name,
      birthDate: item.participant.birthDate,
      gender: item.participant.gender,
      typeInscriptionDescription: item.typeInscription?.description,
    }));
  }

  // Agregações e contagens
  async countByInscriptionId(inscriptionId: string): Promise<number> {
    return this.prisma.accountParticipantInEvent.count({
      where: {
        inscriptionId,
      },
    });
  }
}
