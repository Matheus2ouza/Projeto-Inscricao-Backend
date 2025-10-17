import { EventTicket } from '../entities/event-tickets.entity';

export abstract class EventTicketsGateway {
  abstract create(EventTicket: EventTicket): Promise<EventTicket>;
  abstract findById(id: string): Promise<EventTicket | null>;
  abstract findAll(eventId: string): Promise<EventTicket[]>;
  abstract UpdateAvailable(id: string, available: number): Promise<EventTicket>;
}
