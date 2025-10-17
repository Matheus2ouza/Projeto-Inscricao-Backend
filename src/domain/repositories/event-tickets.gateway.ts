import { EventTicket } from '../entities/event-tickets.entity';

export abstract class EventTicketsGateway {
  abstract create(eventTickets: EventTicket): Promise<EventTicket | null>;
}
