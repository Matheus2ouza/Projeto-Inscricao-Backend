import { InscriptionStatus } from 'generated/prisma';
import { Inscription } from 'src/domain/entities/inscription.entity';

export type SyncInscriptionRecord = {
  id: string;
  accountId?: string;
  eventId: string;
  accessToken?: string;
  confirmationCode?: string;
  guestEmail?: string;
  guestName?: string;
  guestLocality?: string;
  isGuest?: boolean;
  responsible: string;
  email?: string;
  phone: string;
  totalValue: number;
  totalPaid: number;
  status: InscriptionStatus;
  expiresAt?: Date;
  cancelledAt?: Date;
  observation?: string;
  exclusiveLinkId?: string;
  createdAt: Date;
  updatedAt: Date;
};

export class ReceiveSyncInscriptionMapper {
  public static toEntity(record: SyncInscriptionRecord): Inscription {
    return Inscription.with({
      id: record.id,
      accountId: record.accountId || undefined,
      eventId: record.eventId,
      accessToken: record.accessToken || undefined,
      confirmationCode: record.confirmationCode || undefined,
      guestEmail: record.guestEmail || undefined,
      guestName: record.guestName || undefined,
      guestLocality: record.guestLocality || undefined,
      isGuest: record.isGuest,
      responsible: record.responsible,
      phone: record.phone,
      totalValue: Number(record.totalValue),
      totalPaid: Number(record.totalPaid),
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      expiresAt: record.expiresAt || undefined,
      cancelledAt: record.cancelledAt || undefined,
      email: record.email || undefined,
      observation: record.observation || undefined,
      exclusiveLinkId: record.exclusiveLinkId || undefined,
    });
  }
}
