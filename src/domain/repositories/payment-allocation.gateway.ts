import { PaymentAllocation } from '../entities/payment-allocation.entity';

export abstract class PaymentAllocationGateway {
  // CRUD básico
  abstract create(payment: PaymentAllocation): Promise<PaymentAllocation>;

  abstract sumPaidValueByInscription(inscriptionId: string): Promise<number>;
}
