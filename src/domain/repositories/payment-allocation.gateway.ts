import { PaymentMethod } from 'generated/prisma';
import { PaymentAllocation } from '../entities/payment-allocation.entity';

export abstract class PaymentAllocationGateway {
  // CRUD básico
  abstract create(payment: PaymentAllocation): Promise<PaymentAllocation>;
  abstract createMany(payments: PaymentAllocation[]): Promise<void>;

  // Buscas e listagens
  abstract findByPaymentId(paymentId: string): Promise<PaymentAllocation[]>;
  abstract findbyInscriptionId(
    inscriptionId: string,
  ): Promise<PaymentAllocation[]>;
  abstract findManyByInscriptionIds(inscriptionIds: string[]): Promise<
    {
      id: string;
      value: number;
      paymentMethod: PaymentMethod;
    }[]
  >;
  abstract findManyByInscriptionIdsWithMethodAndInscription(
    inscriptionIds: string[],
  ): Promise<
    {
      inscriptionId: string;
      value: number;
      paymentMethod: PaymentMethod;
    }[]
  >;
  abstract sumPaidValueByInscription(inscriptionId: string): Promise<number>;
}
