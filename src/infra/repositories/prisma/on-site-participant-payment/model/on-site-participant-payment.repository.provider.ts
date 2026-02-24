import { Provider } from '@nestjs/common';
import { OnSiteParticipantPaymentGateway } from 'src/domain/repositories/on-site-participant-payment.gateway';
import { OnSiteParticipantPaymentPrismaRepository } from '../on-site-participant-payment.prisma.repository';

export const OnSiteParticipantPaymentPrismaRepositoryProvider: Provider = {
  provide: OnSiteParticipantPaymentGateway,
  useClass: OnSiteParticipantPaymentPrismaRepository,
};
