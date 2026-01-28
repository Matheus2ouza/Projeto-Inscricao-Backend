import { Injectable } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentGateway } from 'src/domain/repositories/payment.gateway';
import { Usecase } from 'src/usecases/usecase';
import { PaymentNotFoundUsecaseException } from '../../exceptions/payment/payment-not-found.usecase.exception';

export type ReversePaymentInput = {
  paymentId: string;
  accountId: string;
};

export type ReversePaymentOutput = {
  id: string;
  status: StatusPayment;
};

@Injectable()
export class ReversePaymentUsecase
  implements Usecase<ReversePaymentInput, ReversePaymentOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly paymentGateway: PaymentGateway,
    private readonly paymentAllocationGateway: PaymentAllocationGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
  ) {}

  async execute(input: ReversePaymentInput): Promise<ReversePaymentOutput> {
    const payment = await this.paymentGateway.findById(input.paymentId);
    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `Payment with id ${input.paymentId} not found`,
        'Pagamento não encontrado',
        ReversePaymentUsecase.name,
      );
    }

    // Se houver uma movimentação financeira associada, guarda o id para deletar depois
    // O delete está após do update do payment para não bater com erro de chave estrangeira
    // const financialMovementId = payment.getFinancialMovementId();

    // Decrementar o valor do pagamento no evento
    if (payment.getStatus() === StatusPayment.APPROVED)
      await this.eventGateway.decrementAmountCollected(
        payment.getEventId(),
        payment.getTotalValue(),
      );

    // Atualizar o estado do pagamento
    payment.reverse();
    await this.paymentGateway.update(payment);

    // if (financialMovementId) {
    //   const financialMovement =
    //     await this.financialMovementGateway.findById(financialMovementId);

    //   if (!financialMovement) {
    //     throw new PaymentNotFoundUsecaseException(
    //       `FinancialMovement with id ${financialMovementId} not found`,
    //       'Movimentação financeira não encontrada',
    //       ReversePaymentUsecase.name,
    //     );
    //   }

    //   await this.financialMovementGateway.delete(financialMovementId);

    //   // Update inscribed accounts
    //   const allocations = await this.paymentAllocationGateway.findByPaymentId(
    //     payment.getId(),
    //   );

    //   const inscriptionIds = allocations.map((allocation) =>
    //     allocation.getInscriptionId(),
    //   );

    //   const inscribedAccounts =
    //     await this.inscriptionGateway.findManyByIds(inscriptionIds);

    //   for (const i of inscribedAccounts) {
    //     if (i.getTotalValue() === i.getTotalPaid()) {
    //       i.inscriptionUnpaid();
    //       await this.inscriptionGateway.update(i);
    //     }
    //   }
    // }

    const output: ReversePaymentOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
    };

    return output;
  }
}
