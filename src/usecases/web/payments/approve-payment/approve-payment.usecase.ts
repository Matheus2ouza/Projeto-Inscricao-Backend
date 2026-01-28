import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { PaymentApprovedEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-approved-email.handler';
import { Usecase } from 'src/usecases/usecase';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';

export type ApprovePaymentInput = {
  paymentId: string;
  accountId: string;
};

export type ApprovePaymentOutput = {
  id: string;
  status: string;
};

@Injectable()
export class ApprovePaymentUsecase
  implements Usecase<ApprovePaymentInput, ApprovePaymentOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentApprovedEmailHandler: PaymentApprovedEmailHandler,
  ) {}

  async execute(input: ApprovePaymentInput): Promise<ApprovePaymentOutput> {
    const payment = await this.paymentGateway.findById(input.paymentId);
    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `Payment with id ${input.paymentId} not found`,
        'Pagamento não encontrado',
        ApprovePaymentUsecase.name,
      );
    }

    // Increment amount collected in event
    await this.eventGateway.incrementAmountCollected(
      payment.getEventId(),
      payment.getTotalValue(),
    );

    const allocations = await this.paymentAllocationGateway.findByPaymentId(
      payment.getId(),
    );

    const inscriptionIds = allocations.map((allocation) =>
      allocation.getInscriptionId(),
    );

    const inscribedAccounts =
      await this.inscriptionGateway.findManyByIds(inscriptionIds);

    for (const i of inscribedAccounts) {
      if (i.getTotalValue() === i.getTotalPaid()) {
        i.inscriptionPaid();
        await this.inscriptionGateway.update(i);
      }
    }

    const output: ApprovePaymentOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
    };

    return output;
  }
}
