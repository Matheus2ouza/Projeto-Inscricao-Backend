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
import { Event } from 'src/domain/entities/event/event.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { PaymentAllocation } from 'src/domain/entities/payment-allocation.entity';
import { PaymentInstallment } from 'src/domain/entities/payment-installment.entity';
import { Payment } from 'src/domain/entities/payment.entity';
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
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: ApprovePaymentInput): Promise<ApprovePaymentOutput> {
    // Busca o pagamento e valida sua existência
    const payment = await this.paymentGateway.findById(input.paymentId);

    if (!payment) {
      throw new PaymentNotFoundUsecaseException(
        `An attempt was made to approve a payment using the ID ${input.paymentId}, but no payment was found.`,
        'Pagamento não encontrado',
        ApprovePaymentUsecase.name,
      );
    }

    // Busca o evento relacionado ao pagamento
    const event = await this.eventGateway.findById(payment.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `An attempt was made to approve the payment, but no related events were found for the payment with ID: ${payment.getId()}.`,
        `Não foi encontrado nenhum evento relacionado a esse pagamento então não foi possivel aprovar`,
        ApprovePaymentUsecase.name,
      );
    }

    // Busca alocações do pagamento e caixas do evento em paralelo
    const [allocations, cashRegisterEvents] = await Promise.all([
      this.paymentAllocationGateway.findByPaymentId(payment.getId()),
      this.cashRegisterEventGateway.findByEventId(payment.getEventId()),
    ]);

    // Cria movimento financeiro e parcela do pagamento
    const { financialMovement, paymentInstallment } =
      this.buildApprovalFinancialData(payment);

    // Atualiza os valores arrecadados do evento
    event.addCollectedAmount(paymentInstallment.getValue());
    event.addNetValueCollected(paymentInstallment.getNetValue());

    // Aprova o pagamento se estiver totalmente pago e ainda não aprovado
    if (
      payment.getStatus() !== StatusPayment.APPROVED &&
      payment.isFullyPaid()
    ) {
      payment.approve(input.accountId);
    }

    // Prepara inscrições para liberação apenas se o pagamento estiver totalmente pago
    const inscriptionsToRelease = payment.isFullyPaid()
      ? await this.prepareInscriptionsToRelease(allocations)
      : [];

    // Calcula total de participantes das inscrições liberadas
    const totalParticipantsToAdd = inscriptionsToRelease.reduce(
      (sum, { participantCount }) => sum + participantCount,
      0,
    );

    // Adiciona os participantes ao evento
    if (totalParticipantsToAdd > 0) {
      event.addParticipants(totalParticipantsToAdd);
    }

    // Prepara as entradas de caixa baseadas nos caixas do evento
    const cashRegisterEntries =
      cashRegisterEvents.length > 0
        ? this.buildCashRegisterEntries(
            cashRegisterEvents,
            payment,
            paymentInstallment,
            input.accountId,
          )
        : [];

    // Atualiza os saldos dos caixas com os valores das entradas
    const updatedCashRegisters =
      cashRegisterEntries.length > 0
        ? await this.buildUpdatedCashRegisters(cashRegisterEntries)
        : [];

    // Executa todas as operações de escrita em uma transação para garantir consistência
    await this.prisma.runInTransaction(async (tx) => {
      // Cria movimento financeiro e parcela
      await this.financialMovementGateway.createTx(financialMovement, tx);
      await this.paymentInstallmentGateway.createTx(paymentInstallment, tx);

      // Atualiza inscrições liberadas
      if (inscriptionsToRelease.length > 0) {
        const inscriptions = inscriptionsToRelease.map(
          ({ inscription }) => inscription,
        );
        await Promise.all(
          inscriptions.map((inscription) =>
            this.inscriptionGateway.updateTx(inscription, tx),
          ),
        );
      }

      // Cria entradas de caixa e atualiza saldos
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

      // Atualiza evento e pagamento
      await this.eventGateway.updateTx(event, tx);
      await this.paymentGateway.updateTx(payment, tx);
    });

    // Envia emails de confirmação para os responsáveis pelas inscrições
    await this.sendApprovedEmailForAllocations(event, payment, allocations);

    return {
      id: payment.getId(),
      status: payment.getStatus(),
    };
  }

  // Cria movimento financeiro de receita e a parcela correspondente do pagamento
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

  // Constrói entradas de caixa para cada caixa associado ao evento
  private buildCashRegisterEntries(
    cashRegisterEvents: CashRegisterEvent[],
    payment: Payment,
    paymentInstallment: PaymentInstallment,
    accountId: string,
  ): CashRegisterEntry[] {
    const paymentImages = payment.getImageUrls();
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
        imageUrls: paymentImages,
      }),
    );
  }

  // Agrupa valores por caixa e atualiza o saldo de cada um
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

  // Prepara inscrições para serem marcadas como pagas
  private async prepareInscriptionsToRelease(
    allocations: PaymentAllocation[],
  ): Promise<{ inscription: Inscription; participantCount: number }[]> {
    const inscriptionIds = this.getUniqueInscriptionIds(allocations);
    const results: { inscription: Inscription; participantCount: number }[] =
      [];

    for (const inscriptionId of inscriptionIds) {
      const inscription = await this.inscriptionGateway.findById(inscriptionId);

      if (!inscription) continue;

      // Verifica se a inscrição ainda não está totalmente paga
      if (
        inscription.getTotalPaid() < inscription.getTotalValue() ||
        inscription.getStatus() === InscriptionStatus.PAID
      ) {
        continue;
      }

      // Marca a inscrição como paga
      inscription.inscriptionPaid();

      const participantCount = await this.inscriptionGateway.countParticipants(
        inscription.getId(),
      );

      this.logger.log(`Inscrição ${inscription.getId()} marcada como PAGA`);

      results.push({ inscription, participantCount });
    }

    return results;
  }

  // Envia emails de aprovação para os responsáveis pelas inscrições
  // No ApprovePaymentUsecase
  private async sendApprovedEmailForAllocations(
    event: Event,
    payment: Payment,
    allocations: PaymentAllocation[],
  ): Promise<void> {
    if (allocations.length === 0) {
      this.logger.warn(
        `Nenhuma alocação encontrada para o pagamento ${payment.getId()}`,
      );
      return;
    }

    if (!payment.getGuestEmail()) {
      this.logger.warn(
        `Email do responsável não encontrado para pagamento ${payment.getId()}`,
      );
      return;
    }

    // Buscar todas as inscrições relacionadas às alocações
    const inscriptionIds = this.getUniqueInscriptionIds(allocations);
    const inscriptions: Inscription[] = [];

    for (const inscriptionId of inscriptionIds) {
      const inscription = await this.inscriptionGateway.findById(inscriptionId);
      if (inscription) {
        inscriptions.push(inscription);
      }
    }

    this.logger.log(
      `Enviando email de aprovação de pagamento para ${payment.getGuestEmail()} com ${allocations.length} alocações`,
    );

    await this.paymentApprovedEmailHandler.sendPaymentApprovedEmail({
      event,
      payment,
      inscriptions,
      allocations,
    });
  }

  // Extrai IDs únicos de inscrições das alocações
  private getUniqueInscriptionIds(allocations: PaymentAllocation[]): string[] {
    return [
      ...new Set(
        allocations.map((allocation) => allocation.getInscriptionId()),
      ),
    ];
  }
}
