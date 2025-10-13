import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { PaymentInscriptionRepository } from '../payment-inscription.prisma.repository';

export const PaymentInscriptionRepositoryProvider = {
  provide: PaymentInscriptionGateway,
  useClass: PaymentInscriptionRepository,
};
