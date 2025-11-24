import { Provider } from '@nestjs/common';
import { TicketUnitGateway } from 'src/domain/repositories/ticket-unit.gatewat';
import { TicketUnitPrismaRepository } from '../ticket-unit.prisma.repository';

export const TicketUnitPrismaRepositoryProvider: Provider = {
  provide: TicketUnitGateway,
  useClass: TicketUnitPrismaRepository,
};
