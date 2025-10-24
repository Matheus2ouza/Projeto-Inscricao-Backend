import { Provider } from '@nestjs/common';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventResponsiblePrismaRepository } from '../event-responsibles.prisma.repository';

export const EventResponsiblePrismaRepositoryProvider: Provider = {
  provide: EventResponsibleGateway,
  useClass: EventResponsiblePrismaRepository,
};
