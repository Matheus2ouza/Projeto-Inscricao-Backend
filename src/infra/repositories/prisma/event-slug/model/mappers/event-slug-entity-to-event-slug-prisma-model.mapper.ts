import { EventSlug } from 'src/domain/entities/event-slug.entity';
import EventSlugPrismaModel from '../event-slug.prisma.model';

export class EventSlugEntityToEventSlugPrimaModelMapper {
  public static map(eventSlug: EventSlug): EventSlugPrismaModel {
    return {
      id: eventSlug.getId(),
      slug: eventSlug.getSlug(),
      eventId: eventSlug.getEventId(),
      isCurrent: eventSlug.getIsCurrent(),
      clickCount: eventSlug.getClickCount(),
      createdAt: eventSlug.getCreatedAt(),
    };
  }
}
