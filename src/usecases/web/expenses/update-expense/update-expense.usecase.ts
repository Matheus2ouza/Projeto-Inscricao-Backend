import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { CategoryExpense, PaymentMethod } from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { EventExpensesNotFoundUsecaseException } from '../../exceptions/expense/event-expense-not-found.usecase.exception';

export type UpdateExpenseInput = {
  id: string;
  description?: string;
  value?: number;
  paymentMethod?: PaymentMethod;
  responsible?: string;
  category?: CategoryExpense;
  imageUrls?: string[];
  createdAt?: Date;
};

export type UpdateExpenseOutput = {
  id: string;
  updated: boolean;
};

@Injectable()
export class UpdateExpenseUsecase
  implements Usecase<UpdateExpenseInput, UpdateExpenseOutput>
{
  private readonly logger = new Logger(UpdateExpenseUsecase.name);

  constructor(
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly eventGateway: EventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: UpdateExpenseInput): Promise<UpdateExpenseOutput> {
    const expense = await this.eventExpensesGateway.findById(input.id);

    if (!expense) {
      throw new EventExpensesNotFoundUsecaseException(
        `Attempt to update expense, but no expense was found to update with the ID ${input.id}`,
        `Nenhum gasto encontrado para atualizar`,
        UpdateExpenseUsecase.name,
      );
    }

    const event = await this.eventGateway.findById(expense.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempt to update expense, but the expense has no associated events.`,
        `Nenhum evento encontrado vinculado ao gasto`,
        UpdateExpenseUsecase.name,
      );
    }

    // Calcular a diferença do valor antes de atualizar
    const oldValue = expense.getValue();
    const newValue = input.value ?? oldValue;
    const valueDrift = new Decimal(newValue).minus(oldValue);

    // Buscar as entradas de caixa relacionadas a essa despesa
    const cashRegisterEntries =
      await this.cashRegisterEntryGateway.findByExpenseId(expense.getId());

    // Se houver diferença no valor e existirem entradas de caixa, precisamos ajustar os caixas
    let updatedCashRegisters: CashRegister[] = [];
    if (
      !valueDrift.isZero() &&
      cashRegisterEntries &&
      cashRegisterEntries.length > 0
    ) {
      updatedCashRegisters = await this.buildUpdatedCashRegistersForValueChange(
        cashRegisterEntries,
        valueDrift,
      );
    }

    // Atualizar o valor gasto do evento com a diferença
    if (!valueDrift.isZero()) {
      if (valueDrift.isPositive()) {
        event.addSpentAmount(valueDrift.toNumber());
      } else {
        event.removeSpentAmount(Math.abs(valueDrift.toNumber()));
      }
    }

    // Atualizar a entidade expense
    expense.update({
      description: input.description,
      value: input.value,
      paymentMethod: input.paymentMethod,
      responsible: input.responsible,
      category: input.category,
      createdAt: input.createdAt,
    });

    // Atualizar as entradas de caixa com o novo valor e método de pagamento
    if (cashRegisterEntries && cashRegisterEntries.length > 0) {
      for (const cashRegisterEntry of cashRegisterEntries) {
        cashRegisterEntry.update({
          value: expense.getValue(),
          method: expense.getPaymentMethod(),
          description: expense.getDescription(),
          responsible: expense.getResponsible(),
        });
      }
    }

    // Executar tudo em transação
    await this.prisma.runInTransaction(async (tx) => {
      // Atualizar o gasto
      await this.eventExpensesGateway.updateTx(expense, tx);

      // Atualizar as entradas de caixa
      if (cashRegisterEntries && cashRegisterEntries.length > 0) {
        for (const cashRegisterEntry of cashRegisterEntries) {
          await this.cashRegisterEntryGateway.updateTx(cashRegisterEntry, tx);
        }
      }

      // Atualizar os caixas com a diferença de valor
      if (updatedCashRegisters.length > 0) {
        for (const cashRegister of updatedCashRegisters) {
          await this.cashRegisterGateway.updateTx(cashRegister, tx);
        }
      }

      // Atualizar o evento com o novo valor gasto
      await this.eventGateway.updateTx(event, tx);
    });

    const output: UpdateExpenseOutput = {
      id: expense.getId(),
      updated: true,
    };

    return output;
  }

  private async buildUpdatedCashRegistersForValueChange(
    entries: CashRegisterEntry[],
    valueDrift: Decimal,
  ): Promise<CashRegister[]> {
    // Calcular o delta que precisa ser ajustado em cada caixa
    const deltaMap = new Map<string, Decimal>();
    for (const entry of entries) {
      const id = entry.getCashRegisterId();
      const current = deltaMap.get(id) ?? new Decimal(0);
      // Para cada entrada, o caixa precisa ser ajustado pelo valueDrift
      deltaMap.set(id, current.add(valueDrift));
    }

    const updated: CashRegister[] = [];
    for (const [cashRegisterId, delta] of deltaMap.entries()) {
      if (delta.isZero()) continue;
      const cashRegister =
        await this.cashRegisterGateway.findById(cashRegisterId);
      if (!cashRegister) continue;

      if (delta.isPositive()) {
        // Se o valor aumentou, precisa decrementar mais o caixa
        cashRegister.decrementBalance(delta.toNumber());
      } else {
        // Se o valor diminuiu, precisa incrementar o caixa (reverter parte)
        cashRegister.incrementBalance(Math.abs(delta.toNumber()));
      }

      updated.push(cashRegister);
    }
    return updated;
  }
}
