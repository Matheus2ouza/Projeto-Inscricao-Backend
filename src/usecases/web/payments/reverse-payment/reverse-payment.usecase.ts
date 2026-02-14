import { Injectable } from '@nestjs/common';
import { StatusPayment } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
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
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
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

    // Se o pagamento estiver aprovado, reverter o pagamento
    if (payment.getStatus() === StatusPayment.APPROVED) {
      const PaymentInstallments =
        await this.paymentInstallmentGateway.findByPaymentId(payment.getId());

      // Deletar as parcelas do pagamento e logo em seguida os movimentos financeiros associados
      await this.paymentInstallmentGateway.deleteMany(payment.getId());
      await this.financialMovementGateway.deleteMany(
        PaymentInstallments.map(
          (installment) => installment.getFinancialMovementId()!,
        ),
      );

      // Deletar as parcelas do pagamento
      await this.paymentInstallmentGateway.deleteMany(payment.getId());

      // Busca as alocações do pagamento
      const paymentAllocations =
        await this.paymentAllocationGateway.findByPaymentId(payment.getId());

      // Para cada alocação é buscada a Inscrição associada
      for (const allocation of paymentAllocations) {
        // Busca a Inscrição associada à alocação
        const inscription = await this.inscriptionGateway.findById(
          allocation.getInscriptionId(),
        );

        if (!inscription) continue;

        // Decrementar o valor da inscrição com base na alocação
        inscription.decrementTotalPaid(allocation.getValue());

        // Se o valor pago for menor que o valor total, marcar a inscrição como não paga
        if (inscription.getTotalPaid() < inscription.getTotalValue()) {
          inscription.inscriptionUnpaid();
        }

        // Atualizar os dados da Inscrição
        await this.inscriptionGateway.update(inscription);
      }

      const event = await this.eventGateway.findById(payment.getEventId());

      // Decrementa o valor do pagamento do valor coletado do evento
      if (event) {
        event.decrementAmountCollected(payment.getTotalValue());
        await this.eventGateway.update(event);
      }
    }

    // Por ultimo reverte os dados do pagamento
    payment.reverse();
    await this.paymentGateway.update(payment);

    const output: ReversePaymentOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
    };

    return output;
  }
}
