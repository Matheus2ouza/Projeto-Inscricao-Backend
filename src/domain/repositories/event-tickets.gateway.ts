import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { EventTicket } from '../entities/event-tickets.entity';

export abstract class EventTicketsGateway {
  // CRUD básico
  abstract create(EventTicket: EventTicket): Promise<EventTicket>;

  // Atualizações
  abstract decrementAvailable(
    id: string,
    quantity: number,
  ): Promise<EventTicket>;
  abstract decrementAvailableTx(
    id: string,
    quantity: number,
    tx: PrismaTransactionClient,
  ): Promise<EventTicket>;
  abstract incrementAvailable(
    id: string,
    quantity: number,
  ): Promise<EventTicket>;

  // Buscas e listagens
  abstract findById(id: string): Promise<EventTicket | null>;
  abstract findByIds(ids: string[]): Promise<EventTicket[]>;
  abstract findAll(eventId: string): Promise<EventTicket[]>;

  // Agregações e contagens
  abstract countByEventId(eventId: string): Promise<number>;
}
