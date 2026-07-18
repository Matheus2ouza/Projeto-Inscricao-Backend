import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { EventExpensesNotFoundUsecaseException } from '../../exceptions/expense/event-expense-not-found.usecase.exception';

export type DeleteExpenseInput = {
  id: string;
};

@Injectable()
export class DeleteExpenseUsecase implements Usecase<DeleteExpenseInput, void> {
  private readonly logger = new Logger(DeleteExpenseUsecase.name);

  constructor(
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly eventGateway: EventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: DeleteExpenseInput): Promise<void> {
    // buscando o gasto pelo id passado no input
    const expense = await this.eventExpensesGateway.findById(input.id);

    if (!expense) {
      throw new EventExpensesNotFoundUsecaseException(
        `Attempt to delete an expense, but an invalid ID was passed: ${input.id}`,
        `Nenhum gasto encontrado para deletar`,
        DeleteExpenseUsecase.name,
      );
    }

    // buscando o evento referente ao gasto passado
    const event = await this.eventGateway.findById(expense.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempting to delete an expense, but the expense has no associated events.`,
        `Nenhum evento encontrado vinculado ao gasto`,
        DeleteExpenseUsecase.name,
      );
    }

    // buscando as entradas de caixa relacionadas a essa despesa
    const cashRegisterEntries =
      await this.cashRegisterEntryGateway.findByExpenseId(expense.getId());

    // preparar os caixas que serão atualizados (reverter o decremento)
    const updatedCashRegisters =
      cashRegisterEntries && cashRegisterEntries.length
        ? await this.buildUpdatedCashRegistersForDeletion(cashRegisterEntries)
        : [];

    // Guardar as URLs das imagens para deletar do storage
    const imageUrls = expense.getImageUrls();

    // decrementar o valor gasto do evento (reverter o incremento que foi feito no create)
    event.removeSpentAmount(expense.getValue());

    // abrir transaction para deletar tudo
    await this.prisma.runInTransaction(async (tx) => {
      // deletar as entradas de caixa relacionadas
      if (cashRegisterEntries && cashRegisterEntries.length) {
        await this.cashRegisterEntryGateway.deleteManyTx(
          cashRegisterEntries,
          tx,
        );

        // atualizar os caixas (reverter o saldo)
        for (const cashRegister of updatedCashRegisters) {
          await this.cashRegisterGateway.updateTx(cashRegister, tx);
        }
      } else {
        this.logger.warn(
          `Nenhuma entrada de caixa encontrada para a despesa ${expense.getId()}`,
        );
      }

      // deletar o gasto
      await this.eventExpensesGateway.deleteTx(expense, tx);

      // atualizar o evento com o novo valor gasto
      await this.eventGateway.updateTx(event, tx);
    });

    // Deletar as imagens do storage fora da transaction (operação externa)
    if (imageUrls && imageUrls.length > 0) {
      try {
        await this.supabaseStorageService.deleteFiles(imageUrls);
        this.logger.log(
          `${imageUrls.length} imagem(ns) do gasto ${expense.getId()} deletada(s) com sucesso do storage`,
        );
      } catch (error: any) {
        // Não lança erro para não comprometer a deleção do banco de dados
        this.logger.error(
          `Erro ao deletar imagens do storage para o gasto ${expense.getId()}: ${error.message}`,
        );
      }
    }
  }

  private async buildUpdatedCashRegistersForDeletion(
    entries: CashRegisterEntry[],
  ): Promise<CashRegister[]> {
    // calcular o delta que precisa ser adicionado de volta ao caixa
    const deltaMap = new Map<string, Decimal>();
    for (const entry of entries) {
      const id = entry.getCashRegisterId();
      const current = deltaMap.get(id) ?? new Decimal(0);
      // como esta sendo deletado o gasto então devolvemos o valor que foi subtraído
      deltaMap.set(id, current.add(entry.getValue()));
    }

    const updated: CashRegister[] = [];
    for (const [cashRegisterId, delta] of deltaMap.entries()) {
      if (delta.isZero()) continue;
      const cashRegister =
        await this.cashRegisterGateway.findById(cashRegisterId);
      if (!cashRegister) continue;
      // incrementar o saldo (reverter o decremento do create)
      cashRegister.incrementBalance(delta.toNumber());
      updated.push(cashRegister);
    }
    return updated;
  }
}
