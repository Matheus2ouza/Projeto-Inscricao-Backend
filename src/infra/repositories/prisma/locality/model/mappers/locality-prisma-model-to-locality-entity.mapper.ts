import { Locality } from 'src/domain/entities/locality/locality.entity';
import LocalityPrismaModel from '../locality.prisma.model';

export class LocalityPrismaModelToLocalityEntityMapper {
  public static map(locality: LocalityPrismaModel): Locality {
    return Locality.with({
      id: locality.id,
      name: locality.name,
      uf: locality.uf,
      regionId: locality.regionId,
      createdAt: locality.createdAt,
      updatedAt: locality.updatedAt,
    });
  }
}
