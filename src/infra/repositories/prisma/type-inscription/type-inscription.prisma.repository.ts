import { Injectable } from '@nestjs/common';
import { TypeInscription } from 'src/domain/entities/type-Inscription.entity';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { PrismaService } from '../prisma.service';
import { TypeInscriptionEntityToTypeInscriptionPrismaModelMapper as EntityToPrisma } from './model/mappers/type-inscription-entity-to-type-inscription-prisma-model.mapper';
import { TypeInscriptionPrismaModelToTypeInscriptionEntityMapper as PrismaToEntity } from './model/mappers/type-inscription-prisma-model-to-type-inscription-entity.mapper';

@Injectable()
export class TypeInscriptionPrismaRepository implements TypeInscriptionGateway {
  constructor(private readonly prisma: PrismaService) {}

  async create(typeInscription: TypeInscription): Promise<TypeInscription> {
    const data = EntityToPrisma.map(typeInscription);
    const created = await this.prisma.typeInscriptions.create({ data });
    return PrismaToEntity.map(created);
  }

  async update(typeInscription: TypeInscription): Promise<TypeInscription> {
    const data = EntityToPrisma.map(typeInscription);
    const updated = await this.prisma.typeInscriptions.update({
      where: { id: typeInscription.getId() },
      data,
    });

    return PrismaToEntity.map(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.typeInscriptions.delete({
      where: {
        id,
      },
    });
  }

  async findById(id: string): Promise<TypeInscription | null> {
    const found = await this.prisma.typeInscriptions.findUnique({
      where: { id },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findByIds(ids: string[]): Promise<TypeInscription[]> {
    const data = await this.prisma.typeInscriptions.findMany({
      where: { id: { in: ids } },
    });

    return data.map(PrismaToEntity.map);
  }

  async findByDescription(
    eventId: string,
    description: string,
  ): Promise<TypeInscription | null> {
    const found = await this.prisma.typeInscriptions.findFirst({
      where: { eventId, description },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findAll(): Promise<TypeInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      include: { event: { select: { name: true } } },
    });
    return found.map(PrismaToEntity.map);
  }

  async findByEventId(
    eventId: string,
    filters?: { active: boolean },
  ): Promise<TypeInscription[]> {
    const where = this.buildWhereClauseTypeInscription(filters);
    const found = await this.prisma.typeInscriptions.findMany({
      where: { eventId, ...where },
      orderBy: { value: 'desc' },
    });
    return found.map(PrismaToEntity.map);
  }

  async findSpecialTypes(eventId: string): Promise<TypeInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      where: { eventId, specialType: true },
      orderBy: { value: 'desc' },
    });
    return found.map(PrismaToEntity.map);
  }

  async findAllDescription(): Promise<TypeInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany();
    return found.map(PrismaToEntity.map);
  }

  async findByIdsAndEventId(
    ids: string[],
    eventId: string,
  ): Promise<(TypeInscription & { currentCount: number })[]> {
    const types = await this.prisma.typeInscriptions.findMany({
      where: {
        id: { in: ids },
        eventId,
        active: true,
      },
      include: {
        _count: {
          select: {
            Participant: {
              where: {
                inscription: {
                  status: { notIn: ['CANCELLED', 'EXPIRED'] },
                },
              },
            },
          },
        },
      },
    });

    return types.map((t) => {
      const { _count, ...rest } = t;
      const entity = PrismaToEntity.map(rest);
      return Object.assign(entity, { currentCount: _count.Participant });
    });
  }

  async findByExclusiveInscriptionLinkId(
    exclusiveInscriptionLinkId: string,
  ): Promise<TypeInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      where: {
        ExclusiveInscriptionLinkType: {
          some: {
            exclusiveLinkId: exclusiveInscriptionLinkId,
          },
        },
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async findByExclusiveLinkIdWithCount(
    exclusiveLinkId: string,
    eventId: string,
  ): Promise<(TypeInscription & { currentCount: number })[]> {
    const types = await this.prisma.typeInscriptions.findMany({
      where: {
        ExclusiveInscriptionLinkType: {
          some: {
            exclusiveLinkId,
          },
        },
      },
      include: {
        _count: {
          select: {
            Participant: {
              where: {
                inscription: {
                  eventId,
                  status: { notIn: ['CANCELLED', 'EXPIRED'] },
                },
              },
            },
          },
        },
        ExclusiveInscriptionLinkType: {
          where: {
            exclusiveLinkId,
          },
          select: {
            exclusiveLinkId: true,
          },
        },
      },
    });

    return types.map((type) => {
      const entity = PrismaToEntity.map(type) as TypeInscription;

      return Object.assign(entity, {
        currentCount: type._count.Participant,
      });
    });
  }

  async findByExclusiveLinkIdsWithCount(
    linkIds: string[],
    eventId: string,
  ): Promise<Record<string, (TypeInscription & { currentCount: number })[]>> {
    const types = await this.prisma.typeInscriptions.findMany({
      where: {
        ExclusiveInscriptionLinkType: {
          some: {
            exclusiveLinkId: { in: linkIds },
          },
        },
      },
      include: {
        _count: {
          select: {
            Participant: {
              where: {
                inscription: {
                  eventId,
                  status: { notIn: ['CANCELLED', 'EXPIRED'] },
                },
              },
            },
          },
        },
        ExclusiveInscriptionLinkType: {
          where: {
            exclusiveLinkId: { in: linkIds },
          },
          select: {
            exclusiveLinkId: true,
          },
        },
      },
    });

    // monta o Record agrupando por linkId
    const result: Record<
      string,
      (TypeInscription & { currentCount: number })[]
    > = {};

    for (const t of types) {
      const { _count, ExclusiveInscriptionLinkType: linkTypes, ...rest } = t;
      const entity = Object.assign(PrismaToEntity.map(rest), {
        currentCount: _count.Participant,
      });

      for (const { exclusiveLinkId } of linkTypes) {
        if (!result[exclusiveLinkId]) result[exclusiveLinkId] = [];
        result[exclusiveLinkId].push(entity);
      }
    }

    return result;
  }

  async findTypeInscriptionByAccountParticipantInEventId(
    accountParticipantId: string,
  ): Promise<TypeInscription | null> {
    const found = await this.prisma.typeInscriptions.findFirst({
      where: {
        accountParticipantInEvent: {
          some: {
            accountParticipantId,
          },
        },
      },
    });
    return found ? PrismaToEntity.map(found) : null;
  }

  async findTypesInUseByEventId(eventId: string): Promise<TypeInscription[]> {
    const found = await this.prisma.typeInscriptions.findMany({
      where: {
        OR: [
          {
            Participant: {
              some: {
                inscription: {
                  eventId,
                },
              },
            },
          },
          {
            accountParticipantInEvent: {
              some: {
                inscription: {
                  eventId,
                },
              },
            },
          },
        ],
      },
    });

    return found.map(PrismaToEntity.map);
  }

  async countAllByEvent(eventId: string): Promise<number> {
    return await this.prisma.typeInscriptions.count({
      where: { eventId },
    });
  }

  async countParticipantsUsingTypeInscription(
    typeInscriptionId: string,
  ): Promise<number> {
    const [participantsCount, accountParticipantsCount] = await Promise.all([
      this.prisma.participant.count({
        where: {
          typeInscriptionId,
        },
      }),
      this.prisma.accountParticipantInEvent.count({
        where: {
          typeInscriptionId,
        },
      }),
    ]);

    return participantsCount + accountParticipantsCount;
  }

  private buildWhereClauseTypeInscription(filters?: { active?: boolean }) {
    const { active } = filters || {};

    return {
      active,
    };
  }
}
