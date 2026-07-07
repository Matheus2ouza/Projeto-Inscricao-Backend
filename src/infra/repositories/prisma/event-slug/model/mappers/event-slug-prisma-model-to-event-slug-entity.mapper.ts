import { EventSlug } from 'src/domain/entities/event-slug.entity';
import EventSlugPrismaModel from '../event-slug.prisma.model';

export abstract class EventSlugPrismaModelToEventSlugEntity {
  public static map(eventSlugPrisma: EventSlugPrismaModel): EventSlug {
    return EventSlug.with({
      id: eventSlugPrisma.id,
      slug: eventSlugPrisma.slug,
      eventId: eventSlugPrisma.eventId,
      isCurrent: eventSlugPrisma.isCurrent,
      clickCount: eventSlugPrisma.clickCount,
      createdAt: eventSlugPrisma.createdAt,
    });
  }
}
