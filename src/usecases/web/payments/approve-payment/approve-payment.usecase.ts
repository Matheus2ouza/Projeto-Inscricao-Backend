import { Injectable, Logger } from '@nestjs/common';
import {
  InscriptionStatus,
  StatusPayment,
  TransactionType,
} from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { PaymentAllocationGateway } from 'src/domain/repositories/payment-allocation.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
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
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly paymentApprovedEmailHandler: PaymentApprovedEmailHandler,
  ) {}

  async execute(input: ApprovePaymentInput): Promise<ApprovePaymentOutput> {
    this.logger.log(`Aprovando pagamento ${input.paymentId}`);
    const payment = await this.paymentGateway.findById(input.paymentId);
    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `Payment with id ${input.paymentId} not found`,
        'Pagamento não encontrado',
        ApprovePaymentUsecase.name,
      );
    }

    this.logger.log(`Payment encontrado: ${payment.getId()}`);

    const allocations = await this.paymentAllocationGateway.findByPaymentId(
      payment.getId(),
    );

    this.logger.log(`Total de alocações encontradas: ${allocations.length}`);

    const inscriptionIds = allocations.map((allocation) =>
      allocation.getInscriptionId(),
    );

    // Cria a movimentação financeira para o pagamento
    const financialMovement = FinancialMovement.create({
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      type: TransactionType.INCOME,
      value: new Decimal(payment.getTotalValue()),
    });

    await this.financialMovementGateway.create(financialMovement);

    this.logger.log(
      `Movimento financeiro criado: R$ ${payment.getTotalValue().toFixed(2)}`,
    );

    // Registra a parcela paga, associando ao movimento financeiro já criado acima
    const paymentInstallment = PaymentInstallment.create({
      paymentId: payment.getId(),
      installmentNumber: 1,
      value: payment.getTotalValue(),
      netValue: payment.getTotalValue(),
      asaasPaymentId: payment.getExternalReference() || payment.getId(),
      financialMovementId: financialMovement.getId(),
      paidAt: new Date(),
    });

    await this.paymentInstallmentGateway.create(paymentInstallment);

    this.logger.log(`Parcela registrada para pagamento ${payment.getId()}`);

    // Adiciona a parcela paga ao pagamento
    payment.addPaidInstallment(
      paymentInstallment.getValue(),
      paymentInstallment.getNetValue(),
    );

    this.logger.log(
      `Pagamento ${payment.getId()} adicionado à parcela ${paymentInstallment.getInstallmentNumber()}`,
    );

    // Atualiza o evento com o valor líquido da parcela
    await this.eventGateway.incrementAmountCollected(
      payment.getEventId(),
      paymentInstallment.getNetValue(),
    );

    this.logger.log(
      `Movimento financeiro associado à parcela: ${financialMovement.getId()}`,
    );

    this.logger.log(
      `Pagamento aprovado! Valor bruto: R$ ${payment
        .getTotalPaid()
        .toFixed(2)} | Valor líquido: R$ ${payment
        .getTotalNetValue()
        .toFixed(2)}`,
    );

    const shouldReleaseInscription = payment.isFullyPaid();

    if (shouldReleaseInscription) {
      this.logger.log(`Pagamento PIX confirmado. Liberando inscrições...`);
    }

    if (!shouldReleaseInscription) {
      this.logger.log(`Aguardando confirmação do pagamento ${payment.getId()}`);
    }

    if (
      payment.getStatus() !== StatusPayment.APPROVED &&
      shouldReleaseInscription
    ) {
      payment.approve(input.accountId);
    }

    if (shouldReleaseInscription) {
      for (const allocation of allocations) {
        const inscription = await this.inscriptionGateway.findById(
          allocation.getInscriptionId(),
        );

        if (!inscription) {
          continue;
        }

        if (inscription.getTotalPaid() >= inscription.getTotalValue()) {
          if (inscription.getStatus() !== InscriptionStatus.PAID) {
            inscription.inscriptionPaid();
            await this.inscriptionGateway.update(inscription);

            this.logger.log(
              `Inscrição ${inscription.getId()} marcada como PAGA`,
            );

            const quantityParticipants =
              await this.inscriptionGateway.countParticipants(
                inscription.getId(),
              );

            await this.eventGateway.incrementQuantityParticipants(
              payment.getEventId(),
              quantityParticipants,
            );

            this.logger.log(
              `Participantes incrementados no evento ${payment.getEventId()}: ${quantityParticipants}`,
            );
          }
        }
      }

      this.logger.log(
        `Payment ${payment.getId()} APROVADO! ` +
          `Total recebido: R$ ${payment.getTotalNetValue().toFixed(2)}`,
      );
    }

    await this.paymentGateway.update(payment);

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
      }

      if (!payment.getIsGuest()) {
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
