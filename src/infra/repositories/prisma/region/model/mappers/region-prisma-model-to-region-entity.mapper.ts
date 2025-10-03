import { Region } from 'src/domain/entities/region.entity';
import RegionPrismaModel from '../region.prisma.model';

export class RegionPrismaModelToRegionEntityMapper {
  public static map(region: RegionPrismaModel): Region {
    return Region.create({
      id: region.id,
      name: region.name,
      createdAt: region.createdAt,
      updatedAt: region.updatedAt,
    });
  }
}
