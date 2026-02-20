import { Injectable } from '@nestjs/common';
import { genderType } from 'generated/prisma';
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
      gender: genderType;
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

  async findParticipantDetailsByInscriptionIdPaginated(
    inscriptionId: string,
    page: number,
    pageSize: number,
  ): Promise<
    {
      participantId: string;
      name: string;
      birthDate: Date;
      gender: genderType;
      typeInscriptionDescription?: string;
    }[]
  > {
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.accountParticipantInEvent.findMany({
      where: {
        inscriptionId,
      },
      include: {
        participant: true,
        typeInscription: {
          select: {
            description: true,
          },
        },
      },
      skip,
      take: pageSize,
      orderBy: { createdAt: 'asc' },
    });

    return found.map((a) => ({
      participantId: a.accountParticipantId,
      name: a.participant.name,
      birthDate: a.participant.birthDate,
      gender: a.participant.gender,
      typeInscriptionDescription: a.typeInscription?.description,
    }));
  }

  async findByInscriptionId(
    inscriptionId: string,
  ): Promise<AccountParticipantInEvent[]> {
    const found = await this.prisma.accountParticipantInEvent.findMany({
      where: {
        inscriptionId,
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async findManyByInscriptionIds(
    inscriptionIds: string[],
  ): Promise<AccountParticipantInEvent[]> {
    const found = await this.prisma.accountParticipantInEvent.findMany({
      where: {
        inscriptionId: {
          in: inscriptionIds,
        },
      },
    });
    return found.map(PrismaToEntity.map);
  }

  async findByEventIdAndAccountIds(
    eventId: string,
    accountIds: string[],
  ): Promise<
    {
      accountId: string | null;
      participantId: string;
      participantName: string;
      participantBirthDate: Date;
      participantGender: genderType;
      typeInscriptionId: string;
      typeInscriptionDescription: string;
    }[]
  > {
    const found = await this.prisma.accountParticipantInEvent.findMany({
      where: {
        inscription: {
          eventId,
          accountId: { in: accountIds },
        },
      },
      include: {
        participant: true,
        typeInscription: true,
        inscription: true,
      },
    });
    return found.map((a) => ({
      accountId: a.inscription.accountId ?? null,
      participantId: a.accountParticipantId,
      participantName: a.participant.name,
      participantBirthDate: a.participant.birthDate,
      participantGender: a.participant.gender,
      typeInscriptionId: a.typeInscription.id,
      typeInscriptionDescription: a.typeInscription?.description,
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

  async countParticipantByInscriptionId(
    inscriptionId: string,
  ): Promise<number> {
    return this.prisma.accountParticipantInEvent.count({
      where: {
        inscriptionId,
      },
    });
  }

  async countParticipantsByEventId(eventId: string): Promise<number> {
    const count = await this.prisma.accountParticipantInEvent.count({
      where: {
        inscription: {
          eventId,
        },
      },
    });
    return count;
  }

  async countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number> {
    return this.prisma.accountParticipantInEvent.count({
      where: {
        inscription: {
          eventId,
        },
        participant: {
          gender,
        },
      },
    });
  }
}
