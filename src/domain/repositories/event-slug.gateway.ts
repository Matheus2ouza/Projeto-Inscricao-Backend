import { EventSlug } from '../entities/event-slug.entity';

export abstract class EventSlugGateway {
  // create
  abstract create(eventSlug: EventSlug): Promise<EventSlug>;

  // find
  abstract findById(id: string): Promise<EventSlug | null>;
  abstract findBySlug(slug: string): Promise<EventSlug | null>;
  abstract findByEventId(eventId: string): Promise<EventSlug | null>;
  abstract findCurrent(eventId: string): Promise<EventSlug | null>;
}
