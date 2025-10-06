import { Provider } from '@nestjs/common';
import { EventPrismaRepository } from './event.prisma.repository';
import { EventGateway } from 'src/domain/repositories/event.gateway';

export const EventPrismaRepositoryProvider: Provider = {
  provide: EventGateway,
  useClass: EventPrismaRepository,
};
