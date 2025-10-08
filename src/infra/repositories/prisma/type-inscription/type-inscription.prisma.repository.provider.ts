import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { TypeInscriptionPrismaRepository } from './type-inscription.prisma.repository';
import { Provider } from '@nestjs/common';

export const TypeInscriptionPrismaRepositoryProvider = {
  provide: TypeInscriptionGateway,
  useClass: TypeInscriptionPrismaRepository,
};
