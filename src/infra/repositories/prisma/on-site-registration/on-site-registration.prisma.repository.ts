import { Injectable } from '@nestjs/common';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { PrismaService } from '../prisma.service';
import { OnSiteRegistrationEntityToOnSiteRegistrationPrismaModelMapper } from './model/mappers/on-site-registration-entity-to-on-site-registration-prisma-model.mapper';
import { OnSiteRegistrationPrismaModelToOnSiteRegistrationEntityMapper } from './model/mappers/on-site-registration-prisma-model-to-on-site-registration-entity.mapper';

@Injectable()
export class OnSiteRegistrationPrismaRepository
  implements OnSiteRegistrationGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    onSiteRegistration: OnSiteRegistration,
  ): Promise<OnSiteRegistration> {
    const data =
      OnSiteRegistrationEntityToOnSiteRegistrationPrismaModelMapper.map(
        onSiteRegistration,
      );
    const created = await this.prisma.onSiteRegistration.create({ data });
    return OnSiteRegistrationPrismaModelToOnSiteRegistrationEntityMapper.map(
      created,
    );
  }

  async findManyPaginated(
    page: number,
    pageSize: number,
    eventId: string,
  ): Promise<OnSiteRegistration[]> {
    const safePage = Math.max(1, Math.floor(page || 1));
    const safePageSize = Math.max(1, Math.min(50, Math.floor(pageSize || 10)));

    const rows = await this.prisma.onSiteRegistration.findMany({
      where: {
        eventId: eventId, // Direct field comparison
      },
      orderBy: { createdAt: 'desc' },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    });

    return rows.map((row) =>
      OnSiteRegistrationPrismaModelToOnSiteRegistrationEntityMapper.map(row),
    );
  }

  async countAll(eventId: string): Promise<number> {
    const total = await this.prisma.onSiteRegistration.count({
      where: {
        eventId: eventId, // Direct field comparison
      },
    });
    return total;
  }
}
