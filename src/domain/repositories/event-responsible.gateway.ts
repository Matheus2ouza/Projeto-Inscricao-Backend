import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { EventResponsible } from '../entities/event-responsibles.entity';

export abstract class EventResponsibleGateway {
  abstract create(
    eventResponsible: EventResponsible,
  ): Promise<EventResponsible>;
  abstract createManyTx(
    eventResponsible: EventResponsible[],
    tx: PrismaTransactionClient,
  ): Promise<void>;
  abstract findByEventId(eventId: string): Promise<EventResponsible[]>;
  abstract findByEventAndAccount(
    eventId: string,
    accountId: string,
  ): Promise<EventResponsible | null>;
  abstract deleteById(id: string): Promise<void>;
  abstract deleteByEventAndAccount(
    eventId: string,
    accountId: string,
  ): Promise<void>;
}
