import { Locality } from 'src/domain/entities/locality/locality.entity';
import LocalityPrismaModel from '../locality.prisma.model';

export class LocalityEntityToLocalityPrismaModelMapper {
  public static map(locality: Locality): LocalityPrismaModel {
    return {
      id: locality.getId(),
      name: locality.getName(),
      uf: locality.getUf(),
      regionId: locality.getRegionId(),
      createdAt: locality.getCreatedAt(),
      updatedAt: locality.getUpdatedAt(),
    };
  }
}
