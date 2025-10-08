import { Inscription } from 'src/domain/entities/inscription.entity';
import InscriptionPrismaModel from '../inscription.prisma.model';
import { Decimal } from '@prisma/client/runtime/library';

export class InscriptionEntityToInscriptionPrismaModelMapper {
  public static map(inscription: Inscription): InscriptionPrismaModel {
    return {
      id: inscription.getId(),
      accountId: inscription.getAccountId(),
      eventId: inscription.getEventId(),
      responsible: inscription.getResponsible(),
      phone: inscription.getPhone(),
      totalValue: new Decimal(inscription.getTotalValue()),
      status: inscription.getStatus(),
      createdAt: inscription.getCreatedAt(),
      updatedAt: inscription.getUpdatedAt(),
    };
  }
}
