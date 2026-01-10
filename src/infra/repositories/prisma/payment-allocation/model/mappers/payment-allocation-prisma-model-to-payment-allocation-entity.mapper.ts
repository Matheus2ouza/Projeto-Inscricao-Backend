import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import PaymentAllocationPrismaModel from '../payment-allocation.prisma.model';

export class PaymentAllocationPrismaModelToPaymentAllocationEntity {
  public static map(
    paymentAllocation: PaymentAllocationPrismaModel,
  ): PaymentAllocation {
    return PaymentAllocation.with({
      id: paymentAllocation.id,
      paymentId: paymentAllocation.paymentId,
      inscriptionId: paymentAllocation.inscriptionId,
      value: Number(paymentAllocation.value),
      createdAt: paymentAllocation.createdAt,
    });
  }
}
