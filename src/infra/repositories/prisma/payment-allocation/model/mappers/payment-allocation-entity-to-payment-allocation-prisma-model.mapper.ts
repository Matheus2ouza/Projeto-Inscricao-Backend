import Decimal from 'decimal.js';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import PaymentAllocationPrismaModel from '../payment-allocation.prisma.model';

export class PaymentAllocationEntityToPaymentAllocationPrismaModel {
  public static map(
    paymentAllocation: PaymentAllocation,
  ): PaymentAllocationPrismaModel {
    return {
      id: paymentAllocation.getId(),
      paymentId: paymentAllocation.getPaymentId(),
      inscriptionId: paymentAllocation.getInscriptionId(),
      value: Decimal(paymentAllocation.getValue()),
      createdAt: paymentAllocation.getCreatedAt(),
    };
  }
}
