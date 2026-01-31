import { Inscription } from 'src/domain/entities/inscription.entity';
import InscriptionPrismaModel from '../inscription.prisma.model';

export class InscriptionPrismaModalToInscriptionEntityMapper {
  public static map(inscription: InscriptionPrismaModel): Inscription {
    return Inscription.with({
      id: inscription.id,
      accountId: inscription.accountId || undefined,
      eventId: inscription.eventId,
      accessToken: inscription.accessToken || undefined,
      confirmationCode: inscription.confirmationCode || undefined,
      guestEmail: inscription.guestEmail || undefined,
      guestName: inscription.guestName || undefined,
      guestLocality: inscription.guestLocality || undefined,
      isGuest: inscription.isGuest,
      responsible: inscription.responsible,
      phone: inscription.phone,
      totalValue: Number(inscription.totalValue),
      totalPaid: Number(inscription.totalPaid),
      status: inscription.status,
      createdAt: inscription.createdAt,
      updatedAt: inscription.updatedAt,
      email: inscription.email || undefined,
    });
  }
}
