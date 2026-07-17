import { Event } from 'src/domain/entities/event/event.entity';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';
import EventPrismaModel from '../event.prisma.model';

export class EventPrismaModelToEventEntityMapper {
  public static map(event: EventPrismaModel): Event {
    return Event.with({
      id: event.id,
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      quantityParticipants: event.quantityParticipants,
      amountCollected: Number(event.amountCollected),
      amountNetValueCollected: Number(event.amountNetValueCollected),
      amountSpent: Number(event.amountSpent),
      imageUrl: event.imageUrl ?? undefined,
      logoUrl: event.logoUrl ?? undefined,
      location: event.location ?? undefined,
      longitude: event.longitude ?? undefined,
      latitude: event.latitude ?? undefined,
      status: event.status,
      allowedInscriptionModes: event.allowedInscriptionModes,
      allowedPaymentModes: event.allowedPaymentModes,
      paymentEnabled: event.paymentEnabled,
      ticketEnabled: event.ticketEnabled ?? undefined,
      regionId: event.regionId,
      participantFieldsConfig:
        (event.participantFieldsConfig as ParticipantFieldsConfig | null) ??
        undefined,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });
  }
}
