import { Injectable } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';

export type RejectedPaymentInput = {
  paymentId: string;
  accountId: string;
  rejectionReason: string;
};

export type RejectedPaymentOutput = {
  id: string;
  status: StatusPayment;
};

@Injectable()
export class RejectedPaymentUsecase
  implements Usecase<RejectedPaymentInput, RejectedPaymentOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
  ) {}

  async execute(input: RejectedPaymentInput): Promise<RejectedPaymentOutput> {
    const payment = await this.paymentGateway.findById(input.paymentId);
    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `Payment with id ${input.paymentId} not found`,
        'Pagamento não encontrado',
        RejectedPaymentUsecase.name,
      );
    }

    // Recuse the payment
    payment.recuse(input.rejectionReason);
    await this.paymentGateway.update(payment);

    const output: RejectedPaymentOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
    };

    return output;
  }
}
