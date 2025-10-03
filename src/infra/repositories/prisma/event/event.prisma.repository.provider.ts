import { Provider } from '@nestjs/common';
import { EventPrismaRepository } from './event.prisma.repository';

export const EventPrismaRepositoryProvider: Provider = {
  provide: 'EventGateway',
  useClass: EventPrismaRepository,
};
