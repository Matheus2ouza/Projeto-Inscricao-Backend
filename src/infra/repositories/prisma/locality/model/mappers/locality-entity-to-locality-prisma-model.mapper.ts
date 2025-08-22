import Decimal from 'decimal.js';
import { Locality } from "src/domain/entities/locality.entity";
import LocalityPrismaModal from "../locality.prisma.model";

export class LocalityEntityToLocalityPrismaModalMapper {
  public static map(locality: Locality): LocalityPrismaModal {
    const aModal: LocalityPrismaModal = {
      id: locality.getId(),
      locality: locality.getLocality(),
      outstanding_balance: new Decimal(locality.getOutstandingBalance()),
      password: locality.getPassword(),
      role: locality.getRole(),
      createdAt: locality.getCreatedAt(),
      updatedAt: locality.getUpdatedAt(),
    }

    return aModal
  }
}