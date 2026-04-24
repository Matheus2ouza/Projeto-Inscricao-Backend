import { Injectable } from '@nestjs/common';
import { genderType, InscriptionStatus } from 'generated/prisma';
import { AccountParticipant } from 'src/domain/entities/account-participant.entity';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountParticipantEntityToAccountParticipantPrismaModelMapper as EntityToPrismaModel } from 'src/infra/repositories/prisma/account-participant/model/mappers/account-participant-entity-to-account-participant-prisma-model.mapper';
import { AccountParticipantPrismaModelToAccountParticipantEntityMapper as PrismaModelToEntity } from 'src/infra/repositories/prisma/account-participant/model/mappers/account-participant-prisma-model-to-account-participant-entity.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AccountParticipantPrismaRepository
  implements AccountParticipantGateway
{
  constructor(private prisma: PrismaService) {}

  async create(
    accountParticipant: AccountParticipant,
  ): Promise<AccountParticipant> {
    const data = EntityToPrismaModel.map(accountParticipant);
    const accountParticipantPrismaModel =
      await this.prisma.accountParticipant.create({
        data,
      });
    return PrismaModelToEntity.map(accountParticipantPrismaModel);
  }

  async update(
    accountParticipant: AccountParticipant,
  ): Promise<AccountParticipant> {
    const data = EntityToPrismaModel.map(accountParticipant);
    const accountParticipantPrismaModel =
      await this.prisma.accountParticipant.update({
        where: {
          id: accountParticipant.getId(),
        },
        data,
      });
    return PrismaModelToEntity.map(accountParticipantPrismaModel);
  }

  //Busca e listagens
  async findById(id: string): Promise<AccountParticipant | null> {
    const found = await this.prisma.accountParticipant.findUnique({
      where: {
        id,
      },
    });
    return found ? PrismaModelToEntity.map(found) : null;
  }

  async findByIds(ids: string[]): Promise<AccountParticipant[]> {
    const accountParticipantPrismaModel =
      await this.prisma.accountParticipant.findMany({
        where: {
          id: {
            in: ids,
          },
        },
      });
    return accountParticipantPrismaModel.map(PrismaModelToEntity.map);
  }

  async findAllByAccountId(accountId: string): Promise<AccountParticipant[]> {
    const accountParticipantPrismaModel =
      await this.prisma.accountParticipant.findMany({
        where: {
          accountId,
        },
      });
    return accountParticipantPrismaModel.map(PrismaModelToEntity.map);
  }

  async findByInscriptionsIds(
    inscriptionIds: string[],
    filter: {
      typeInscriptionId?: string | string[];
    },
  ): Promise<AccountParticipant[]> {
    const where = this.buildWhereClause(filter);
    const found = await this.prisma.accountParticipant.findMany({
      where: {
        eventLinks: {
          some: {
            inscription: {
              id: { in: inscriptionIds },
              status: InscriptionStatus.PAID,
              isGuest: false,
            },
            ...(where.typeInscriptionId && {
              typeInscriptionId: where.typeInscriptionId,
            }),
          },
        },
      },
    });

    return found.map(PrismaModelToEntity.map);
  }

  async findAll(filter?: { regionId?: string }): Promise<AccountParticipant[]> {
    const found = await this.prisma.accountParticipant.findMany({
      where: {
        account: {
          regionId: filter?.regionId,
        },
      },
    });

    return found.map(PrismaModelToEntity.map);
  }

  async findByInscriptionId(
    inscriptionId: string,
  ): Promise<AccountParticipant[]> {
    const find = await this.prisma.accountParticipant.findMany({
      where: {
        eventLinks: {
          some: {
            inscriptionId,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return find.map(PrismaModelToEntity.map);
  }

  async findAllPaginated(
    page: number,
    pageSize: number,
    filter: { accountId?: string },
  ): Promise<AccountParticipant[]> {
    const where = this.buildWhereClause(filter);
    const accountParticipantPrismaModel =
      await this.prisma.accountParticipant.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });
    return accountParticipantPrismaModel.map(PrismaModelToEntity.map);
  }

  async findManyByEventId(
    eventId: string,
    page: number,
    pageSize: number,
  ): Promise<AccountParticipant[]> {
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.accountParticipant.findMany({
      skip,
      take: pageSize,
      where: {
        eventLinks: {
          some: {
            inscription: {
              eventId,
              isGuest: false,
              status: InscriptionStatus.PAID,
            },
          },
        },
      },
    });
    return found.map(PrismaModelToEntity.map);
  }

  //Agregações e contagens
  async countAllFiltered(filter: { accountId?: string }): Promise<number> {
    const where = this.buildWhereClause(filter);
    return await this.prisma.accountParticipant.count({
      where,
    });
  }

  async countAllByEventId(eventId: string): Promise<number> {
    const count = await this.prisma.accountParticipant.count({
      where: {
        eventLinks: {
          some: {
            inscription: {
              eventId,
              isGuest: false,
              status: InscriptionStatus.PAID,
            },
          },
        },
      },
    });

    return count;
  }

  async countParticipantsByEventIdAndGender(
    eventId: string,
    gender: genderType,
  ): Promise<number> {
    const count = await this.prisma.accountParticipant.count({
      where: {
        eventLinks: {
          some: {
            inscription: {
              eventId,
              isGuest: false,
              status: InscriptionStatus.PAID,
            },
          },
        },
        gender,
      },
    });

    return count;
  }

  private buildWhereClause(filter?: {
    accountId?: string;
    typeInscriptionId?: string | string[];
  }) {
    const { accountId, typeInscriptionId } = filter || {};

    const typeInscriptionArray = typeInscriptionId
      ? Array.isArray(typeInscriptionId)
        ? typeInscriptionId
        : [typeInscriptionId]
      : [];

    return {
      accountId,
      typeInscriptionId:
        typeInscriptionArray.length > 0
          ? { in: typeInscriptionArray }
          : undefined,
    };
  }
}
