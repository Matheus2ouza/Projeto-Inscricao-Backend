import { EventResponsible } from 'src/domain/entities/event-responsibles.entity';
import EventResponsiblePrismaModel from '../event-responsibles.prisma.model';

export class EventResponsibleEntityToEventResponsiblePrismaModelMapper {
  public static map(
    eventResponsible: EventResponsible,
  ): Omit<EventResponsiblePrismaModel, 'event' | 'account'> {
    return {
      id: eventResponsible.getId(),
      eventId: eventResponsible.getEventId(),
      accountId: eventResponsible.getAccountId(),
    };
  }
}
