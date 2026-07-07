import { Provider } from '@nestjs/common';
import { EventSlugGateway } from 'src/domain/repositories/event-slug.gateway';
import { EventSlugPrismaRepository } from './event-slug.prisma.repository';

export const EventSlugPrismaRepositoryProvider: Provider = {
  provide: EventSlugGateway,
  useClass: EventSlugPrismaRepository,
};
