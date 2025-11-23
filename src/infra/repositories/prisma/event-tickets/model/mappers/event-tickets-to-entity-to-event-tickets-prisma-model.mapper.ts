import Decimal from 'decimal.js';
import { EventTicket } from 'src/domain/entities/event-tickets.entity';
import EventTicketsPrismaModel from '../event-tickets.prisma.model';

export class EventTicketToEntityToEventTicketPrismaModelMapper {
  public static map(eventTicket: EventTicket): EventTicketsPrismaModel {
    return {
      id: eventTicket.getId(),
      eventId: eventTicket.getEventId(),
      name: eventTicket.getName(),
      description: eventTicket.getDescription() ?? null,
      quantity: eventTicket.getQuantity(),
      price: new Decimal(eventTicket.getPrice()),
      available: eventTicket.getAvailable(),
      expirationDate: eventTicket.getExpirationDate(),
      isActive: eventTicket.getIsActive(),
      createdAt: eventTicket.getCreatedAt(),
      updatedAt: eventTicket.getUpdatedAt(),
    };
  }
}
