import { Inscription } from 'src/domain/entities/inscription.entity';
import InscriptionPrismaModel from '../inscription.prisma.model';

export class InscriptionPrismaModalToInscriptionEntityMapper {
  public static map(inscription: InscriptionPrismaModel): Inscription {
    return Inscription.with({
      id: inscription.id,
      accountId: inscription.accountId,
      eventId: inscription.eventId,
      responsible: inscription.responsible,
      phone: inscription.phone,
      totalValue: Number(inscription.totalValue),
      status: inscription.status,
      createdAt: inscription.createdAt,
      updatedAt: inscription.updatedAt,
      email: inscription.email || undefined,
    });
  }
}
