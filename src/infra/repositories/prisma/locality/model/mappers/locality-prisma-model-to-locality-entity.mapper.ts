import { Locality } from "src/domain/entities/locality.entity";
import LocalityPrismaModal from "../locality.prisma.model";

export class LocalityPrismaModalToLocalityEntityMapper {
  public static map(locality: LocalityPrismaModal): Locality {
    const anLocality = Locality.with({
      id: locality.id,
      locality: locality.locality,
      password: locality.password,
      outstandingBalance: Number(locality.outstanding_balance),
      role: locality.role,
      createdAt: locality.createdAt,
      updatedAt: locality.updatedAt
    })

    return anLocality
  }
}