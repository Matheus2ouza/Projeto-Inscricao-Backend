import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { PaymentMethod } from 'generated/prisma';
import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import { FinancialMovement } from 'src/domain/entities/financial-movement';
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

    const created = await this.eventExpensesGateway.create(eventExpense);

    const financialMovement = FinancialMovement.create({
      eventId: event.getId(),
      accountId: input.accountId,
      type: 'EXPENSE',
      value: new Decimal(created.getValue()),
    });
    await this.financialMovementGateway.create(financialMovement);
    await this.eventGateway.decrementAmountCollected(
      event.getId(),
      eventExpense.getValue(),
    );

    return {
      id: created.getId(),
    };
  }
}
