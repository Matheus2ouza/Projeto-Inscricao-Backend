import { Region } from 'src/domain/entities/region.entity';
import RegionPrismaModel from '../region.prisma.model';

export class RegionEntityToRegionPrismaModelMapper {
  public static map(region: Region): RegionPrismaModel {
    return {
      id: region.getId(),
      name: region.getName(),
      createdAt: region.getCreatedAt(),
      updatedAt: region.getUpdatedAt(),
    };
  }
}
