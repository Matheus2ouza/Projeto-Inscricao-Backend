import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { TypeInscriptionPrismaRepository } from '../type-inscription.prisma.repository';

export const TypeInscriptionPrismaRepositoryProvider = {
  provide: TypeInscriptionGateway,
  useClass: TypeInscriptionPrismaRepository,
};
