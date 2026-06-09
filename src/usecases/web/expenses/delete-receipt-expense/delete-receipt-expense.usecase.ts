import { Injectable, Logger } from '@nestjs/common';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventExpensesNotFoundUsecaseException } from '../../exceptions/expense/event-expense-not-found.usecase.exception';
import { ReceiptIndexInvalidUsecaseException } from '../../exceptions/expense/receipt-index-invalid.usecase.exception';

export type DeleteReceiptExpenseInput = {
  id: string;
  receiptIndex: number;
};

export type DeleteReceiptExpenseOutput = {
  deleted: boolean;
  remainingReceipts: number;
};

@Injectable()
export class DeleteReceiptExpenseUsecase
  implements Usecase<DeleteReceiptExpenseInput, DeleteReceiptExpenseOutput>
{
  private readonly logger = new Logger(DeleteReceiptExpenseUsecase.name);
  constructor(
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: DeleteReceiptExpenseInput,
  ): Promise<DeleteReceiptExpenseOutput> {
    const expense = await this.eventExpensesGateway.findById(input.id);

    if (!expense) {
      throw new EventExpensesNotFoundUsecaseException(
        `Attempt to delete a receipt but the corresponding expense was not found: ${input.id}`,
        `Nenhum gasto encontrado para deletar o comprovante`,
        DeleteReceiptExpenseUsecase.name,
      );
    }

    const currentImages = expense.getImageUrls();
    const receiptIndex = input.receiptIndex;

    // Validar se o índice existe
    if (receiptIndex < 0 || receiptIndex >= currentImages.length) {
      throw new ReceiptIndexInvalidUsecaseException(
        `Attempt to delete receipt with invalid index: ${receiptIndex}. Current receipts count: ${currentImages.length}`,
        `Comprovante não encontrado`,
        DeleteReceiptExpenseUsecase.name,
      );
    }

    // Pegar a URL da imagem que será deletada antes de remover
    const imageUrlToDelete = currentImages[receiptIndex];

    // Remover a imagem do array usando o método da entidade
    expense.removeImageUrl(receiptIndex);

    // Buscar as entradas de caixa relacionadas a essa despesa
    const cashRegisterEntries =
      await this.cashRegisterEntryGateway.findByExpenseId(expense.getId());

    // Atualizar as entradas de caixa removendo a mesma imagem
    if (cashRegisterEntries && cashRegisterEntries.length > 0) {
      for (const cashRegisterEntry of cashRegisterEntries) {
        const entryImages = cashRegisterEntry.getImageUrls();
        if (entryImages && entryImages.length > receiptIndex) {
          cashRegisterEntry.removeImageUrl(receiptIndex);
        }
      }
    }

    // Executar em transação
    await this.prisma.runInTransaction(async (tx) => {
      // Atualizar o gasto
      await this.eventExpensesGateway.updateTx(expense, tx);

      // Atualizar as entradas de caixa
      if (cashRegisterEntries && cashRegisterEntries.length > 0) {
        for (const cashRegisterEntry of cashRegisterEntries) {
          await this.cashRegisterEntryGateway.updateTx(cashRegisterEntry, tx);
        }
      }
    });

    // Deletar a imagem do storage fora da transação
    if (imageUrlToDelete) {
      try {
        await this.supabaseStorageService.deleteFile(imageUrlToDelete);
        this.logger.log(
          `Comprovante deletado do storage para o gasto ${expense.getId()}: ${imageUrlToDelete}`,
        );
      } catch (error: any) {
        // Não lançar erro para não comprometer a atualização do banco
        this.logger.error(
          `Erro ao deletar comprovante do storage para o gasto ${expense.getId()}: ${error.message}`,
        );
      }
    }

    const output: DeleteReceiptExpenseOutput = {
      deleted: true,
      remainingReceipts: expense.getImageUrls().length,
    };

    return output;
  }
}
