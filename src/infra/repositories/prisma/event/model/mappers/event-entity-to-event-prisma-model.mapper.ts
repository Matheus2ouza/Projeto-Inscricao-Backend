import { Event } from 'src/domain/entities/event.entity';
import EventPrismaModel from '../event.prisma.model';

export class EventEntityToEventPrismaModelMapper {
  public static map(event: Event): EventPrismaModel {
    return {
      id: event.getId(),
      name: event.getName(),
      date: event.getDate(),
      regionId: event.getRegionId(),
      createdAt: event.getCreatedAt(),
      updatedAt: event.getUpdatedAt(),
    };
  }
}
