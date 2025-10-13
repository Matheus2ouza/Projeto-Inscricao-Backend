import { Provider } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { EventPrismaRepository } from '../event.prisma.repository';

export const EventPrismaRepositoryProvider: Provider = {
  provide: EventGateway,
  useClass: EventPrismaRepository,
};
