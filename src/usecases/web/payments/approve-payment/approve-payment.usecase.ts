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
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { Payment } from 'src/domain/entities/payment.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
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

type ResponsibleContact = {
  name: string;
  email: string;
};

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
    private readonly accountGateway: AccountGateway,
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly paymentApprovedEmailHandler: PaymentApprovedEmailHandler,
  ) {}

  async execute(input: ApprovePaymentInput): Promise<ApprovePaymentOutput> {
    this.logger.log(`Aprovando pagamento ${input.paymentId}`);

    const payment = await this.getPaymentOrThrow(input.paymentId);
    const event = await this.eventGateway.findById(payment.getEventId());
    const allocations = await this.paymentAllocationGateway.findByPaymentId(
      payment.getId(),
    );

    this.logger.log(`Total de alocações encontradas: ${allocations.length}`);

    const { financialMovement, paymentInstallment } =
      await this.registerApprovalFinancialData(payment, input.accountId);

    if (event) {
      event.incrementAmountCollected(paymentInstallment.getValue());
      event.incrementAmountNetValueCollected(paymentInstallment.getNetValue());
    }

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
    this.logInscriptionReleaseState(payment.getId(), shouldReleaseInscription);

    if (
      payment.getStatus() !== StatusPayment.APPROVED &&
      shouldReleaseInscription
    ) {
      payment.approve(input.accountId);
    }

    if (shouldReleaseInscription && event) {
      const totalParticipantsToAdd = await this.releasePaidInscriptions(
        allocations,
        payment.getEventId(),
      );

      for (let i = 0; i < totalParticipantsToAdd; i += 1) {
        event.incrementParticipantsCount();
      }

      this.logger.log(
        `Payment ${payment.getId()} APROVADO! ` +
          `Total recebido: R$ ${payment.getTotalNetValue().toFixed(2)}`,
      );
    }

    if (event) {
      await this.eventGateway.update(event);
    }

    await this.paymentGateway.update(payment);
    await this.sendApprovedEmailForAllocations(payment, allocations);

    return {
      id: payment.getId(),
      status: payment.getStatus(),
    };
  }

  private async getPaymentOrThrow(paymentId: string): Promise<Payment> {
    const payment = await this.paymentGateway.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `Payment with id ${paymentId} not found`,
        'Pagamento não encontrado',
        ApprovePaymentUsecase.name,
      );
    }

    this.logger.log(`Payment encontrado: ${payment.getId()}`);
    return payment;
  }

  private async registerApprovalFinancialData(
    payment: Payment,
    accountId: string,
  ): Promise<{
    financialMovement: FinancialMovement;
    paymentInstallment: PaymentInstallment;
  }> {
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

    payment.addPaidInstallment(
      paymentInstallment.getValue(),
      paymentInstallment.getNetValue(),
    );
    payment.setTotalReceived(paymentInstallment.getNetValue());

    this.logger.log(
      `Pagamento ${payment.getId()} adicionado à parcela ${paymentInstallment.getInstallmentNumber()}`,
    );

    await this.createCashRegisterEntries(
      payment,
      paymentInstallment,
      accountId,
    );

    return { financialMovement, paymentInstallment };
  }

  private async createCashRegisterEntries(
    payment: Payment,
    paymentInstallment: PaymentInstallment,
    accountId: string,
  ): Promise<void> {
    const cashRegisterEvents =
      await this.cashRegisterEventGateway.findByEventId(payment.getEventId());

    if (cashRegisterEvents.length === 0) {
      return;
    }

    const entries = cashRegisterEvents.map((cashRegisterEvent) =>
      CashRegisterEntry.create({
        cashRegisterId: cashRegisterEvent.getCashRegisterId(),
        type: CashEntryType.INCOME,
        origin: CashEntryOrigin.INTERNAL,
        method: PaymentMethod.PIX,
        value: paymentInstallment.getNetValue(),
        description: `Pagamento PIX referente a parcela ${paymentInstallment.getInstallmentNumber()} de ${payment.getInstallments()} do pagamento ${payment.getId()}`,
        eventId: payment.getEventId(),
        paymentInstallmentId: paymentInstallment.getId(),
        responsible: accountId,
        imageUrl: payment.getImageUrl(),
      }),
    );

    await this.cashRegisterEntryGateway.createMany(entries);
    await this.updateCashRegisterBalances(entries);
  }

  private logInscriptionReleaseState(
    paymentId: string,
    shouldReleaseInscription: boolean,
  ): void {
    if (shouldReleaseInscription) {
      this.logger.log('Pagamento PIX confirmado. Liberando inscrições...');
      return;
    }

    this.logger.log(`Aguardando confirmação do pagamento ${paymentId}`);
  }

  private async releasePaidInscriptions(
    allocations: PaymentAllocation[],
    eventId: string,
  ): Promise<number> {
    let totalParticipantsToAdd = 0;
    const inscriptionIds = this.getUniqueInscriptionIds(allocations);

    for (const inscriptionId of inscriptionIds) {
      const inscription = await this.inscriptionGateway.findById(inscriptionId);

      if (!inscription) {
        continue;
      }

      if (
        inscription.getTotalPaid() < inscription.getTotalValue() ||
        inscription.getStatus() === InscriptionStatus.PAID
      ) {
        continue;
      }

      inscription.inscriptionPaid();
      await this.inscriptionGateway.update(inscription);

      this.logger.log(`Inscrição ${inscription.getId()} marcada como PAGA`);

      const quantityParticipants =
        await this.inscriptionGateway.countParticipants(inscription.getId());

      totalParticipantsToAdd += quantityParticipants;

      this.logger.log(
        `Participantes incrementados no evento ${eventId}: ${quantityParticipants}`,
      );
    }

    return totalParticipantsToAdd;
  }

  private async sendApprovedEmailForAllocations(
    payment: Payment,
    allocations: PaymentAllocation[],
  ): Promise<void> {
    const inscriptionIds = this.getUniqueInscriptionIds(allocations);

    if (inscriptionIds.length === 0) {
      return;
    }

    const baseResponsible = await this.resolveResponsibleFromPayment(payment);

    for (const inscriptionId of inscriptionIds) {
      const responsible = await this.resolveResponsibleForInscription(
        inscriptionId,
        baseResponsible,
      );

      if (!responsible.email) {
        this.logger.warn(
          `Email do responsável não encontrado para pagamento ${payment.getId()} (Inscrição: ${inscriptionId})`,
        );
        continue;
      }

      this.logger.log(
        `Enviando email de aprovação de pagamento para ${responsible.email} (Inscrição: ${inscriptionId})`,
      );

      await this.paymentApprovedEmailHandler.sendPaymentApprovedEmail({
        paymentId: payment.getId(),
        inscriptionId,
        eventId: payment.getEventId(),
        responsibleName: responsible.name,
        responsibleEmail: responsible.email,
        paymentValue: payment.getTotalValue(),
        paymentDate: new Date(),
      });
    }
  }

  private async resolveResponsibleFromPayment(
    payment: Payment,
  ): Promise<ResponsibleContact> {
    if (payment.getIsGuest()) {
      return {
        name: payment.getGuestName() || '',
        email: payment.getGuestEmail() || '',
      };
    }

    const accountId = payment.getAccountId();
    if (!accountId) {
      return { name: '', email: '' };
    }

    const account = await this.accountGateway.findById(accountId);
    return {
      name: account?.getUsername() || '',
      email: account?.getEmail() || '',
    };
  }

  private async resolveResponsibleForInscription(
    inscriptionId: string,
    baseResponsible: ResponsibleContact,
  ): Promise<ResponsibleContact> {
    if (baseResponsible.name && baseResponsible.email) {
      return baseResponsible;
    }

    const inscription = await this.inscriptionGateway.findById(inscriptionId);
    return {
      name: baseResponsible.name || inscription?.getResponsible() || '',
      email: baseResponsible.email || inscription?.getEmail() || '',
    };
  }

  private getUniqueInscriptionIds(allocations: PaymentAllocation[]): string[] {
    return [
      ...new Set(
        allocations.map((allocation) => allocation.getInscriptionId()),
      ),
    ];
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
