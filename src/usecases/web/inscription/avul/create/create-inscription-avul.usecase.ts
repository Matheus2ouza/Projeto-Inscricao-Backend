import { Injectable, Optional } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import {
  CashEntryOrigin,
  CashEntryType,
  genderType,
  InscriptionStatus,
  PaymentMethod,
} from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { OnSiteParticipantPaymentGateway } from 'src/domain/repositories/on-site-participant-payment.gateway';
import { OnSiteParticipantGateway } from 'src/domain/repositories/on-site-participant.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { SyncQueue } from 'src/infra/sync/sync.queue';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type CreateInscriptionAvulInput = {
  eventId: string;
  responsible: string;
  phone: string;
  totalValue: number;
  status: InscriptionStatus;
  accountId: string;
  participants: {
    name: string;
    birthDate: Date;
    gender: genderType;
    payments: {
      paymentMethod: PaymentMethod;
      value: Decimal;
    }[];
  }[];
};

export type CreateInscriptionAvulOutput = {
  id: string;
};

@Injectable()
export class CreateInscriptionAvulUsecase
  implements Usecase<CreateInscriptionAvulInput, CreateInscriptionAvulOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
    private readonly onSiteRegistrationGateway: OnSiteRegistrationGateway,
    private readonly onSiteParticipantGateway: OnSiteParticipantGateway,
    private readonly onSiteParticipantPaymentGateway: OnSiteParticipantPaymentGateway,
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly prisma: PrismaService,
    @Optional() private readonly syncQueue: SyncQueue,
  ) {}

  async execute(
    input: CreateInscriptionAvulInput,
  ): Promise<CreateInscriptionAvulOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to create on-site registration for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        CreateInscriptionAvulUsecase.name,
      );
    }

    // Criar entities em memória
    const registration = OnSiteRegistration.create({
      eventId: input.eventId,
      responsible: input.responsible,
      phone: input.phone,
      totalValue: new Decimal(input.totalValue),
      status: input.status,
    });

    const participantsWithPayments = input.participants.map((p) => {
      const participantPayments = p.payments ?? [];

      const participant = OnSiteParticipant.create({
        onSiteRegistrationId: registration.getId(),
        name: p.name,
        gender: p.gender,
      });

      const payments = participantPayments.map((payment) =>
        OnSiteParticipantPayment.create({
          participantId: participant.getId(),
          paymentMethod: payment.paymentMethod,
          value: new Decimal(payment.value),
        }),
      );

      return { participant, payments };
    });

    const payments = participantsWithPayments.flatMap(
      ({ payments: participantPayments }) => participantPayments,
    );

    const participants = participantsWithPayments.map(
      ({ participant }) => participant,
    );

    const totalPaymentsValue = payments.reduce(
      (acc, payment) => acc.plus(payment.getValue()),
      new Decimal(0),
    );

    // Criar movimentações financeiras em memória
    const financialMovements = payments.map((payment) =>
      FinancialMovement.create({
        eventId: event.getId(),
        accountId: input.accountId,
        type: 'INCOME',
        value: payment.getValue(),
      }),
    );

    // Buscar caixas do evento
    const cashRegisterEvents =
      await this.cashRegisterEventGateway.findByEventId(event.getId());

    // Criar entradas de caixa em memória
    const participantNameById = new Map(
      participants.map((p) => [p.getId(), p.getName()] as const),
    );

    const cashEntries =
      cashRegisterEvents.length > 0 && payments.length > 0
        ? payments.flatMap((payment) => {
            const participantName =
              participantNameById.get(payment.getParticipantId()) ?? '';

            return cashRegisterEvents.map((c) =>
              CashRegisterEntry.create({
                cashRegisterId: c.getCashRegisterId(),
                type: CashEntryType.INCOME,
                origin: CashEntryOrigin.ONSITE,
                method: payment.getPaymentMethod(),
                value: payment.getValue().toNumber(),
                description: participantName
                  ? `Pagamento ${payment.getPaymentMethod()} - ${participantName}`
                  : `Pagamento ${payment.getPaymentMethod()}`,
                eventId: event.getId(),
                onSiteRegistrationId: registration.getId(),
                responsible: input.responsible,
              }),
            );
          })
        : [];

    // Atualizar caixas em memória
    const updatedCashRegisters = cashEntries.length
      ? await this.buildUpdatedCashRegisters(cashEntries)
      : [];

    // Atualizar o evento em memória
    event.addCollectedAmount(totalPaymentsValue.toNumber());
    event.addNetValueCollected(totalPaymentsValue.toNumber());
    event.addParticipants(participants.length);

    // Executar tudo em transação
    await this.prisma.runInTransaction(async (tx) => {
      // Salvar inscrição com participantes e pagamentos

      await this.onSiteRegistrationGateway.createTx(registration, tx);
      await this.onSiteParticipantGateway.createManyTx(participants, tx);
      await this.onSiteParticipantPaymentGateway.createManyTx(payments, tx);

      // Salvar movimentações financeiras
      for (const financialMovement of financialMovements) {
        await this.financialMovementGateway.createTx(financialMovement, tx);
      }

      // Salvar entradas de caixa se existirem
      if (cashEntries.length) {
        await this.cashRegisterEntryGateway.createManyTx(cashEntries, tx);

        // Atualizar caixas
        for (const cashRegister of updatedCashRegisters) {
          await this.cashRegisterGateway.updateTx(cashRegister, tx);
        }
      }

      // Atualizar evento
      await this.eventGateway.updateTx(event, tx);
    });

    // Somente para sincronização durante evento
    if (process.env.EVENT_MODE === 'true') {
      await this.syncQueue.enqueueJob({
        table: 'onSiteRegistration',
        recordId: registration.getId(),
      });

      for (const participant of participants) {
        await this.syncQueue.enqueueJob({
          table: 'onSiteParticipant',
          recordId: participant.getId(),
        });
      }

      for (const payment of payments) {
        await this.syncQueue.enqueueJob({
          table: 'onSiteParticipantPayment',
          recordId: payment.getId(),
        });
      }

      for (const financialMovement of financialMovements) {
        await this.syncQueue.enqueueJob({
          table: 'financialMovement',
          recordId: financialMovement.getId(),
        });
      }

      for (const cashEntry of cashEntries) {
        await this.syncQueue.enqueueJob({
          table: 'cashRegisterEntry',
          recordId: cashEntry.getId(),
        });
      }

      for (const cashRegister of updatedCashRegisters) {
        await this.syncQueue.enqueueJob({
          table: 'cashRegister',
          recordId: cashRegister.getId(),
        });
      }

      await this.syncQueue.enqueueJob({
        table: 'events',
        recordId: event.getId(),
      });
    }

    return { id: registration.getId() };
  }

  private async buildUpdatedCashRegisters(
    entries: CashRegisterEntry[],
  ): Promise<CashRegister[]> {
    const deltaMap = new Map<string, number>();
    for (const entry of entries) {
      const id = entry.getCashRegisterId();
      const delta =
        entry.getType() === CashEntryType.INCOME
          ? entry.getValue()
          : -entry.getValue();
      deltaMap.set(id, (deltaMap.get(id) ?? 0) + delta);
    }

    const updated: CashRegister[] = [];
    for (const [cashRegisterId, delta] of deltaMap.entries()) {
      if (delta === 0) continue;
      const cashRegister =
        await this.cashRegisterGateway.findById(cashRegisterId);
      if (!cashRegister) continue;

      if (delta > 0) {
        cashRegister.incrementBalance(delta);
      } else {
        cashRegister.decrementBalance(-delta);
      }

      updated.push(cashRegister);
    }
    return updated;
  }
}
