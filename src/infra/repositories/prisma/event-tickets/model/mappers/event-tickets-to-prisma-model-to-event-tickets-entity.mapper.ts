import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import EventTicketsPrismaModel from '../event-tickets.prisma.model';

export class EventTicketToPrismaModelToEnvetTicketEntityMapper {
  public static map(eventTicket: EventTicketsPrismaModel): EventTicket {
    return EventTicket.with({
      id: eventTicket.id,
      eventId: eventTicket.eventId,
      name: eventTicket.name,
      description: eventTicket.description ?? undefined,
      quantity: eventTicket.quantity,
      price: Number(eventTicket.price),
      available: eventTicket.available,
      expirationDate: eventTicket.expirationDate,
      isActive: eventTicket.isActive,
      createdAt: eventTicket.createdAt,
      updatedAt: eventTicket.updatedAt,
    });
  }
}
