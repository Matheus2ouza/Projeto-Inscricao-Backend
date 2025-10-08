import { Provider } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { InscriptionPrismaRepository } from './inscription.prisma.repository';

export const InscriptionPrismaRepositoryProvider: Provider = {
  provide: InscriptionGateway,
  useClass: InscriptionPrismaRepository,
};
