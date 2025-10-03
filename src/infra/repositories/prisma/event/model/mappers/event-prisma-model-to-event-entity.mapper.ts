import { Event } from 'src/domain/entities/event.entity';
import EventPrismaModel from '../event.prisma.model';

export class EventPrismaModelToEventEntityMapper {
  public static map(event: EventPrismaModel): Event {
    return Event.with({
      id: event.id,
      name: event.name,
      date: event.date,
      regionId: event.regionId,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    });
  }
}
