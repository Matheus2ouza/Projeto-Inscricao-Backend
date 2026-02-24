import { Provider } from '@nestjs/common';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { TypeInscriptionPrismaRepository } from '../type-inscription.prisma.repository';

export const TypeInscriptionPrismaRepositoryProvider: Provider = {
  provide: TypeInscriptionGateway,
  useClass: TypeInscriptionPrismaRepository,
};
