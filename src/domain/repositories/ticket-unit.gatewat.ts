import { TicketUnit } from '../entities/ticket-unit.entity';

export abstract class TicketUnitGateway {
  abstract create(ticketUnit: TicketUnit): Promise<TicketUnit>;
}
