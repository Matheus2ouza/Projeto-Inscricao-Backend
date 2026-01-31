import Decimal from 'decimal.js';
import { Inscription } from 'src/domain/entities/inscription.entity';
import InscriptionPrismaModel from '../inscription.prisma.model';

export class InscriptionEntityToInscriptionPrismaModelMapper {
  public static map(inscription: Inscription): InscriptionPrismaModel {
    return {
      id: inscription.getId(),
      accountId: inscription.getAccountId() ?? null,
      eventId: inscription.getEventId(),
      accessToken: inscription.getAccessToken() ?? null,
      confirmationCode: inscription.getConfirmationCode() ?? null,
      guestEmail: inscription.getGuestEmail() ?? null,
      guestName: inscription.getGuestName() ?? null,
      guestLocality: inscription.getGuestLocality() ?? null,
      isGuest: inscription.getIsGuest(),
      responsible: inscription.getResponsible(),
      email: inscription.getEmail() ?? null,
      phone: inscription.getPhone(),
      totalValue: new Decimal(inscription.getTotalValue()),
      totalPaid: new Decimal(inscription.getTotalPaid()),
      status: inscription.getStatus(),
      createdAt: inscription.getCreatedAt(),
      updatedAt: inscription.getUpdatedAt(),
    };
  }
}
