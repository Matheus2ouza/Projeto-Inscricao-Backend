import { Injectable } from '@nestjs/common';
import { genderType, InscriptionStatus } from 'generated/prisma';
import { AccountParticipant } from 'src/domain/entities/account-participant/account-participant.entity';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountParticipantEntityToAccountParticipantPrismaModelMapper as EntityToPrisma } from 'src/infra/repositories/prisma/account-participant/model/mappers/account-participant-entity-to-account-participant-prisma-model.mapper';
import { AccountParticipantPrismaModelToAccountParticipantEntityMapper as PrismaToEntity } from 'src/infra/repositories/prisma/account-participant/model/mappers/account-participant-prisma-model-to-account-participant-entity.mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AccountParticipantPrismaRepository
  implements AccountParticipantGateway
{
  constructor(private prisma: PrismaService) {}

  async create(
    accountParticipant: AccountParticipant,
  ): Promise<AccountParticipant> {
    const data = EntityToPrisma.map(accountParticipant);
    const accountParticipantPrismaModel =
      await this.prisma.accountParticipant.create({
        data,
      });
    return PrismaToEntity.map(accountParticipantPrismaModel);
  }

  async update(
    accountParticipant: AccountParticipant,
  ): Promise<AccountParticipant> {
    const data = EntityToPrisma.map(accountParticipant);
    const accountParticipantPrismaModel =
      await this.prisma.accountParticipant.update({
        where: {
          id: accountParticipant.getId(),
        },
        data,
      });
    return PrismaToEntity.map(accountParticipantPrismaModel);
  }

  //Busca e listagens
  async findById(id: string): Promise<AccountParticipant | null> {
    const found = await this.prisma.accountParticipant.findUnique({
      where: {
        id,
      },
    });
    return found ? PrismaToEntity.map(found) : null;
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
    return accountParticipantPrismaModel.map(PrismaToEntity.map);
  }

  async findAllByAccountId(accountId: string): Promise<AccountParticipant[]> {
    const accountParticipantPrismaModel =
      await this.prisma.accountParticipant.findMany({
        where: {
          locality: {
            accounts: { some: { accountId } },
          },
        },
      });
    return accountParticipantPrismaModel.map(PrismaToEntity.map);
  }

  public async findAllByAccountIds(
    accountIds: string[],
  ): Promise<AccountParticipant[]> {
    const accountParticipantPrismaModel =
      await this.prisma.accountParticipant.findMany({
        where: {
          locality: {
            accounts: { some: { accountId: { in: accountIds } } },
          },
        },
      });
    return accountParticipantPrismaModel.map(PrismaToEntity.map);
  }

  public async findAllByLocalityId(
    localityId: string,
  ): Promise<AccountParticipant[]> {
    const found = await this.prisma.accountParticipant.findMany({
      where: {
        localityId,
      },
    });

    return found.map(PrismaToEntity.map);
  }

  public async findAllByLocalityIds(
    localityIds: string[],
  ): Promise<AccountParticipant[]> {
    const found = await this.prisma.accountParticipant.findMany({
      where: {
        localityId: {
          in: localityIds,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async findByInscriptionsIds(
    inscriptionIds: string[],
    filter: {
      typeInscriptionId?: string | string[];
      startDate?: string;
      endDate?: string;
    },
  ): Promise<AccountParticipant[]> {
    const where = this.buildWhereClause(filter);
    const found = await this.prisma.accountParticipant.findMany({
      where: {
        ...where,
        eventLinks: {
          some: {
            inscription: {
              id: { in: inscriptionIds },
              isGuest: false,
            },
          },
        },
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async findAll(filter?: { regionId?: string }): Promise<AccountParticipant[]> {
    const found = await this.prisma.accountParticipant.findMany({
      where: {
        locality: {
          regionId: filter?.regionId,
        },
      },
    });

    return found.map(PrismaToEntity.map);
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
    return find.map(PrismaToEntity.map);
  }

  async findAllPaginated(
    page: number,
    pageSize: number,
    filter: { localityId?: string },
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
    return accountParticipantPrismaModel.map(PrismaToEntity.map);
  }

  async findManyByEventId(
    eventId: string,
    page: number,
    pageSize: number,
    filters?: {
      inscriptionStatus?: InscriptionStatus[];
      typeInscriptionId: string | string[];
      orderByName: 'asc' | 'desc';
    },
  ): Promise<AccountParticipant[]> {
    const sortOrderName = filters?.orderByName === 'asc' ? 'asc' : 'desc';
    const where = this.buildWhereClause(filters);
    const skip = (page - 1) * pageSize;
    const found = await this.prisma.accountParticipant.findMany({
      skip,
      take: pageSize,
      where: {
        ...where,
        eventLinks: {
          some: {
            inscription: {
              eventId,
              isGuest: false,
            },
          },
        },
      },
      orderBy: {
        name: sortOrderName,
      },
    });
    return found.map(PrismaToEntity.map);
  }

  //Agregações e contagens
  async countAllFiltered(filter: { localityId?: string }): Promise<number> {
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

  async countParticipantsByEventIdGroupedByGender(
    eventId: string,
    filters: {
      inscriptionStatus?: InscriptionStatus[];
      typeInscriptionId: string | string[];
    },
  ): Promise<{ male: number; female: number }> {
    const where = this.buildWhereClause(filters);
    const result = await this.prisma.accountParticipant.groupBy({
      by: 'gender',
      where: {
        ...where,
        eventLinks: {
          some: {
            inscription: {
              eventId,
              isGuest: false,
            },
          },
        },
      },
      _count: {
        gender: true,
      },
    });

    const response = {
      male: 0,
      female: 0,
    };

    for (const item of result) {
      if (item.gender === genderType.MASCULINO) {
        response.male = item._count.gender;
      }

      if (item.gender === genderType.FEMININO) {
        response.female = item._count.gender;
      }
    }

    return response;
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
    localityId?: string;
    typeInscriptionId?: string | string[];
    inscriptionStatus?: InscriptionStatus[];
  }) {
    const { localityId, typeInscriptionId, inscriptionStatus } = filter || {};

    const typeInscriptionArray = typeInscriptionId
      ? Array.isArray(typeInscriptionId)
        ? typeInscriptionId
        : [typeInscriptionId]
      : [];

    const inscriptionStatusArray = inscriptionStatus
      ? Array.isArray(inscriptionStatus)
        ? inscriptionStatus
        : [inscriptionStatus]
      : [];

    const hasEventLinkFilter =
      typeInscriptionArray.length > 0 || inscriptionStatusArray.length > 0;

    return {
      localityId,
      ...(hasEventLinkFilter && {
        eventLinks: {
          some: {
            ...(typeInscriptionArray.length > 0 && {
              typeInscriptionId: { in: typeInscriptionArray },
            }),
            ...(inscriptionStatusArray.length > 0 && {
              inscription: { status: { in: inscriptionStatusArray } },
            }),
          },
        },
      }),
    };
  }
}
