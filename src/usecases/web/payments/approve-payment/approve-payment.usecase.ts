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
import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { Inscription } from 'src/domain/entities/inscription.entity';
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
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { PaymentApprovedEmailHandler } from 'src/infra/services/mail/handlers/payment/payment-approved-email.handler';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
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
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: ApprovePaymentInput): Promise<ApprovePaymentOutput> {
    const payment = await this.paymentGateway.findById(input.paymentId);

    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `An attempt was made to approve a payment using the ID ${input.paymentId}, but no payment was found.`,
        'Pagamento não encontrado',
        ApprovePaymentUsecase.name,
      );
    }

    const event = await this.eventGateway.findById(payment.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `An attempt was made to approve the payment, but no related events were found for the payment with ID: ${payment.getId()}.`,
        `Não foi encontrado nenhum evento relacionado a esse pagamento então não foi possivel aprovar`,
        ApprovePaymentUsecase.name,
      );
    }

    const [allocations, cashRegisterEvents] = await Promise.all([
      this.paymentAllocationGateway.findByPaymentId(payment.getId()),
      this.cashRegisterEventGateway.findByEventId(payment.getEventId()),
    ]);

    const { financialMovement, paymentInstallment } =
      this.buildApprovalFinancialData(payment);

    event.incrementAmountCollected(paymentInstallment.getValue());
    event.incrementAmountNetValueCollected(paymentInstallment.getNetValue());

    if (
      payment.getStatus() !== StatusPayment.APPROVED &&
      payment.isFullyPaid()
    ) {
      payment.approve(input.accountId);
    }

    // prepara inscrições (leituras + mutações de domínio, sem escrita)
    const inscriptionsToRelease = payment.isFullyPaid()
      ? await this.prepareInscriptionsToRelease(allocations)
      : [];

    const totalParticipantsToAdd = inscriptionsToRelease.reduce(
      (sum, { participantCount }) => sum + participantCount,
      0,
    );

    for (let i = 0; i < totalParticipantsToAdd; i += 1) {
      event.incrementParticipantsCount();
    }

    // prepara entradas do caixa (leituras + montagem, sem escrita)
    const cashRegisterEntries =
      cashRegisterEvents.length > 0
        ? this.buildCashRegisterEntries(
            cashRegisterEvents,
            payment,
            paymentInstallment,
            input.accountId,
          )
        : [];

    const updatedCashRegisters =
      cashRegisterEntries.length > 0
        ? await this.buildUpdatedCashRegisters(cashRegisterEntries)
        : [];

    // todas as escritas dentro da transaction
    await this.prisma.runInTransaction(async (tx) => {
      await this.financialMovementGateway.createTx(financialMovement, tx);
      await this.paymentInstallmentGateway.createTx(paymentInstallment, tx);

      if (inscriptionsToRelease.length > 0) {
        const inscriptions = inscriptionsToRelease.map(
          ({ inscription }) => inscription,
        );
        await this.inscriptionGateway.updateManyTx(inscriptions, tx);
      }

      if (cashRegisterEntries.length > 0) {
        await this.cashRegisterEntryGateway.createManyTx(
          cashRegisterEntries,
          tx,
        );
        await this.cashRegisterGateway.updateManyTx(updatedCashRegisters, tx);
      } else {
        this.logger.warn(
          `Nenhum caixa encontrado para o evento ${payment.getEventId()}`,
        );
      }

      await this.eventGateway.updateTx(event, tx);
      await this.paymentGateway.updateTx(payment, tx);
    });

    await this.sendApprovedEmailForAllocations(payment, allocations);

    return {
      id: payment.getId(),
      status: payment.getStatus(),
    };
  }

  private buildApprovalFinancialData(payment: Payment): {
    financialMovement: FinancialMovement;
    paymentInstallment: PaymentInstallment;
  } {
    const financialMovement = FinancialMovement.create({
      eventId: payment.getEventId(),
      accountId: payment.getAccountId(),
      type: TransactionType.INCOME,
      value: new Decimal(payment.getTotalValue()),
    });

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

    payment.addPaidInstallment(
      paymentInstallment.getValue(),
      paymentInstallment.getNetValue(),
    );
    payment.setTotalReceived(paymentInstallment.getNetValue());

    return { financialMovement, paymentInstallment };
  }

  private buildCashRegisterEntries(
    cashRegisterEvents: CashRegisterEvent[],
    payment: Payment,
    paymentInstallment: PaymentInstallment,
    accountId: string,
  ): CashRegisterEntry[] {
    return cashRegisterEvents.map((cashRegisterEvent) =>
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
  }

  private async buildUpdatedCashRegisters(
    entries: CashRegisterEntry[],
  ): Promise<CashRegister[]> {
    const deltaByCashRegisterId = new Map<string, number>();

    for (const entry of entries) {
      const id = entry.getCashRegisterId();
      deltaByCashRegisterId.set(
        id,
        (deltaByCashRegisterId.get(id) ?? 0) + entry.getValue(),
      );
    }

    const results = await Promise.all(
      [...deltaByCashRegisterId.entries()].map(
        async ([cashRegisterId, delta]) => {
          if (delta === 0) return null;
          const cashRegister =
            await this.cashRegisterGateway.findById(cashRegisterId);
          if (!cashRegister) return null;
          cashRegister.incrementBalance(delta);
          return cashRegister;
        },
      ),
    );

    return results.filter((cr): cr is CashRegister => cr !== null);
  }

  private async prepareInscriptionsToRelease(
    allocations: PaymentAllocation[],
  ): Promise<{ inscription: Inscription; participantCount: number }[]> {
    const inscriptionIds = this.getUniqueInscriptionIds(allocations);
    const results: { inscription: Inscription; participantCount: number }[] =
      [];

    for (const inscriptionId of inscriptionIds) {
      const inscription = await this.inscriptionGateway.findById(inscriptionId);

      if (!inscription) continue;

      if (
        inscription.getTotalPaid() < inscription.getTotalValue() ||
        inscription.getStatus() === InscriptionStatus.PAID
      ) {
        continue;
      }

      inscription.inscriptionPaid();

      const participantCount = await this.inscriptionGateway.countParticipants(
        inscription.getId(),
      );

      this.logger.log(`Inscrição ${inscription.getId()} marcada como PAGA`);

      results.push({ inscription, participantCount });
    }

    return results;
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
}
