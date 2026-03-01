import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import {
  CashEntryOrigin,
  CashEntryType,
  genderType,
  InscriptionStatus,
  PaymentMethod,
} from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { OnSiteParticipantPayment } from 'src/domain/entities/on-site-participant-payment.entity';
import { OnSiteParticipant } from 'src/domain/entities/on-site-participant.entity';
import { OnSiteRegistration } from 'src/domain/entities/on-site-registration.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { OnSiteRegistrationGateway } from 'src/domain/repositories/on-site-registration.gateway';
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
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
  ) {}

  async execute(
    input: CreateInscriptionAvulInput,
  ): Promise<CreateInscriptionAvulOutput> {
    const eventExists = await this.eventGateway.findById(input.eventId);

    if (!eventExists) {
      throw new EventNotFoundUsecaseException(
        `attempt to create on-site registration for event: ${input.eventId} but it was not found`,
        'Evento não encontrado',
        CreateInscriptionAvulUsecase.name,
      );
    }

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

    const createdRegistration =
      await this.onSiteRegistrationGateway.createWithParticipantsAndPayments(
        registration,
        participants,
        payments,
      );

    const totalPaymentsValue = payments.reduce(
      (acc, payment) => acc.plus(payment.getValue()),
      new Decimal(0),
    );

    const financialMovements = payments.map((payment) =>
      FinancialMovement.create({
        eventId: eventExists.getId(),
        accountId: input.accountId,
        type: 'INCOME',
        value: payment.getValue(),
      }),
    );

    // Incrementar as movimentações financeiras
    await Promise.all(
      financialMovements.map((financialMovement) =>
        this.financialMovementGateway.create(financialMovement),
      ),
    );

    const cashRegisterEvents =
      await this.cashRegisterEventGateway.findByEventId(eventExists.getId());

    if (cashRegisterEvents.length > 0 && payments.length > 0) {
      const participantNameById = new Map(
        participants.map((p) => [p.getId(), p.getName()] as const),
      );

      const cashEntries = payments.flatMap((payment, idx) => {
        const participantName =
          participantNameById.get(payment.getParticipantId()) ?? '';

        const financialMovement = financialMovements[idx];

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
            eventId: eventExists.getId(),
            onSiteRegistrationId: createdRegistration.getId(),
            responsible: input.responsible,
          }),
        );
      });

      await this.cashRegisterEntryGateway.createMany(cashEntries);
      await this.updateCashRegisterBalances(cashEntries);
    }

    // Incrementar o valor coletado no evento
    await this.eventGateway.incrementAmountCollected(
      eventExists.getId(),
      totalPaymentsValue.toNumber(),
    );

    // Incrementar a quantidade de participantes no evento
    await this.eventGateway.incrementQuantityParticipants(
      eventExists.getId(),
      participants.length,
    );

    return { id: createdRegistration.getId() };
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
