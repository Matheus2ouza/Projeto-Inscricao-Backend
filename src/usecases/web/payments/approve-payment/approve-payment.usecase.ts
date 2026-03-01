import { Injectable, Logger } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  InscriptionStatus,
  PaymentMethod,
  StatusPayment,
  TransactionType,
} from 'generated/prisma';
import { Decimal } from 'generated/prisma/runtime/library';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
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
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
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
      received: true,
      value: payment.getTotalValue(),
      netValue: payment.getTotalValue(),
      financialMovementId: financialMovement.getId(),
      paidAt: new Date(),
      estimatedAt: new Date(),
    });

    await this.paymentInstallmentGateway.create(paymentInstallment);

    this.logger.log(`Parcela registrada para pagamento ${payment.getId()}`);

    // Adiciona a parcela paga ao pagamento
    payment.addPaidInstallment(
      paymentInstallment.getValue(),
      paymentInstallment.getNetValue(),
    );

    // Adiciona o valor recebido ao pagamento
    payment.setTotalReceived(paymentInstallment.getNetValue());

    this.logger.log(
      `Pagamento ${payment.getId()} adicionado à parcela ${paymentInstallment.getInstallmentNumber()}`,
    );

    const cashRegisterEvent = await this.cashRegisterEventGateway.findByEventId(
      payment.getEventId(),
    );

    if (cashRegisterEvent.length > 0) {
      const entries = cashRegisterEvent.map((c) =>
        CashRegisterEntry.create({
          cashRegisterId: c.getCashRegisterId(),
          type: CashEntryType.INCOME,
          origin: CashEntryOrigin.INTERNAL,
          method: PaymentMethod.PIX,
          value: paymentInstallment.getNetValue(),
          description: `Pagamento PIX ${payment.getId()}`,
          eventId: payment.getEventId(),
          paymentInstallmentId: paymentInstallment.getId(),
          responsible: input.accountId,
          imageUrl: payment.getImageUrl(),
        }),
      );

      await this.cashRegisterEntryGateway.createMany(entries);
      await this.updateCashRegisterBalances(entries);
    }

    // Atualiza o evento com o valor bruto da parcela
    await this.eventGateway.incrementAmountCollected(
      payment.getEventId(),
      paymentInstallment.getValue(),
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

  private async updateCashRegisterBalances(
    entries: CashRegisterEntry[],
  ): Promise<void> {
    const deltaByCashRegisterId = new Map<string, number>();

    for (const entry of entries) {
      const cashRegisterId = entry.getCashRegisterId();
      const previous = deltaByCashRegisterId.get(cashRegisterId) ?? 0;
      const delta =
        entry.getType() === CashEntryType.INCOME
          ? entry.getValue()
          : -entry.getValue();

      deltaByCashRegisterId.set(cashRegisterId, previous + delta);
    }

    await Promise.all(
      [...deltaByCashRegisterId.entries()].map(
        async ([cashRegisterId, delta]) => {
          if (delta === 0) return;
          const cashRegister =
            await this.cashRegisterGateway.findById(cashRegisterId);
          if (!cashRegister) return;

          if (delta > 0) {
            cashRegister.incrementBalance(delta);
          } else {
            cashRegister.decrementBalance(-delta);
          }

          await this.cashRegisterGateway.update(cashRegister);
        },
      ),
    );
  }
}
