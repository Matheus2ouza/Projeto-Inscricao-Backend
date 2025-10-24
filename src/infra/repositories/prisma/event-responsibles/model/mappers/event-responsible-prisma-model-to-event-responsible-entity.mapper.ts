import { EventResponsible } from 'src/domain/entities/event-responsibles.entity';
import EventResponsiblePrismaModel from '../event-responsibles.prisma.model';

export class EventResponsiblePrismaModelToEventResponsibleEntityMapper {
  public static map(
    eventResponsible: EventResponsiblePrismaModel,
  ): EventResponsible {
    return EventResponsible.with({
      id: eventResponsible.id,
      eventId: eventResponsible.eventId,
      accountId: eventResponsible.accountId,
    });
  }
}
