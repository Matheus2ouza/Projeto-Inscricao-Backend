import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { OnSiteRegistrationPrismaRepository } from '../on-site-registration.prisma.repository';

export const OnSiteRegistrationPrismaRepositoryProvider = {
  provide: OnSiteRegistrationGateway,
  useClass: OnSiteRegistrationPrismaRepository,
};
