import { Injectable, Logger } from '@nestjs/common';
import { TransactionType } from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
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
  private readonly logger = new Logger(ApprovePaymentUsecase.name);

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
        // Se o valor total pago for igual ao valor total, marcar como pago
        i.inscriptionPaid();
        await this.inscriptionGateway.update(i);

        // Incrementar a quantidade de participantes no evento
        const quantityParticipants =
          await this.inscriptionGateway.countParticipants(i.getId());

        await this.eventGateway.incrementQuantityParticipants(
          payment.getEventId(),
          quantityParticipants,
        );
      }
    }

    // Cria a movimentação financeira para o pagamento
    const financialMovement = FinancialMovement.create({
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      type: TransactionType.INCOME,
      value: new Decimal(payment.getTotalValue()),
    });

    await this.financialMovementGateway.create(financialMovement);

    // Enviar email de pagamento aprovado
    const inscriptionId = allocations[0]?.getInscriptionId();
    if (inscriptionId) {
      const inscription = await this.inscriptionGateway.findById(inscriptionId);

      let responsibleName = '';
      let responsibleEmail = '';
      let responsiblePhone = '';

      if (payment.getIsGuest()) {
        responsibleName = payment.getGuestName() || '';
        responsibleEmail = payment.getGuestEmail() || '';
        responsiblePhone = inscription?.getPhone() || '';
      } else {
        const accountId = payment.getAccountId();
        if (accountId) {
          const account = await this.inscriptionGateway.findById(inscriptionId);
          responsibleName = account?.getResponsible() || '';
          responsibleEmail = account?.getEmail() || '';
          responsiblePhone = account?.getPhone() || '';
        }
      }

      if (responsibleEmail) {
        this.logger.log(
          `Enviando email de aprovação de pagamento para ${responsibleEmail} (Inscrição: ${inscriptionId})`,
        );
        await this.paymentApprovedEmailHandler.sendPaymentApprovedEmail({
          paymentId: payment.getId(),
          inscriptionId,
          eventId: payment.getEventId(),
          responsibleName,
          responsibleEmail,
          responsiblePhone,
          paymentValue: payment.getTotalValue(),
          paymentDate: new Date(),
        });
      } else {
        this.logger.warn(
          `Email do responsável não encontrado para pagamento ${payment.getId()} (Inscrição: ${inscriptionId})`,
        );
      }
    }

    const output: ApprovePaymentOutput = {
      id: payment.getId(),
      status: payment.getStatus(),
    };

    return output;
  }
}
