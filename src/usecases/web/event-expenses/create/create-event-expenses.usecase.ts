import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
} from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type CreateEventExpensesInput = {
  accountId: string;
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
};

export type CreateEventExpensesOutput = {
  id: string;
};

@Injectable()
export class CreateEventExpensesUsecase
  implements Usecase<CreateEventExpensesInput, CreateEventExpensesOutput>
{
  public constructor(
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly eventGateway: EventGateway,
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
  ) {}

  async execute(
    input: CreateEventExpensesInput,
  ): Promise<CreateEventExpensesOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempt to register event expense but Event was not found, eventId: ${input.eventId}`,
        `Evento não encontrado`,
        CreateEventExpensesUsecase.name,
      );
    }

    const eventExpense = EventExpenses.create({
      eventId: event.getId(),
      description: input.description,
      value: input.value,
      paymentMethod: input.paymentMethod,
      responsible: input.responsible,
    });

    const expense = await this.eventExpensesGateway.create(eventExpense);

    const financialMovement = FinancialMovement.create({
      eventId: event.getId(),
      accountId: input.accountId,
      type: 'EXPENSE',
      value: new Decimal(expense.getValue()),
    });
    await this.financialMovementGateway.create(financialMovement);

    const cashRegisterEvent = await this.cashRegisterEventGateway.findByEventId(
      event.getId(),
    );

    if (cashRegisterEvent.length > 0) {
      const entries = cashRegisterEvent.map((c) =>
        CashRegisterEntry.create({
          cashRegisterId: c.getCashRegisterId(),
          type: CashEntryType.EXPENSE,
          origin: CashEntryOrigin.EXPENSE,
          method: expense.getPaymentMethod(),
          value: expense.getValue(),
          description: expense.getDescription(),
          eventId: event.getId(),
          eventExpenseId: expense.getId(),
          responsible: expense.getResponsible(),
        }),
      );

      await this.cashRegisterEntryGateway.createMany(entries);
      await this.updateCashRegisterBalances(entries);
    }

    // atualiza o valor gasto do evento com a nova saida
    event.incrementAmountSpent(expense.getValue());
    await this.eventGateway.update(event);

    return {
      id: expense.getId(),
    };
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
