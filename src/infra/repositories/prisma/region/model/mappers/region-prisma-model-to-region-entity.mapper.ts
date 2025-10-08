import { Region } from 'src/domain/entities/region.entity';
import RegionPrismaModel from '../region.prisma.model';

// O tipo RegionPrismaModel pode ser parcial e conter _count
export class RegionPrismaModelToRegionEntityMapper {
  public static map(
    region: RegionPrismaModel & {
      _count?: { events?: number; accounts?: number };
    },
  ): Region {
    return Region.with({
      id: region.id,
      name: region.name,
      outstandingBalance: Number(region.outstandingBalance),
      createdAt: region.createdAt,
      updatedAt: region.updatedAt,
      numberOfEvents: region._count?.events,
      numberOfAccounts: region._count?.accounts,
    });
  }
}
