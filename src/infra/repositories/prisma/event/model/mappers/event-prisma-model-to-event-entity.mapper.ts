import { Event } from 'src/domain/entities/event.entity';
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
      imageUrl: event.imageUrl ?? undefined,
      logoUrl: event.logoUrl ?? undefined,
      location: event.location ?? undefined,
      longitude: event.longitude ?? undefined,
      latitude: event.latitude ?? undefined,
      status: event.status,
      paymentEnabled: event.paymentEnabled,
      regionId: event.regionId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });
  }
}
