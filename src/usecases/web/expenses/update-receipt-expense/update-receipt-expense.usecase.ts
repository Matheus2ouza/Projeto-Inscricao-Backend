import { Injectable, Logger } from '@nestjs/common';
import { CategoryExpense } from 'generated/prisma';
import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import { Event } from 'src/domain/entities/event.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { generateExpenseSlug } from 'src/shared/utils/expense-file-name.util';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { EventExpensesNotFoundUsecaseException } from '../../exceptions/expense/event-expense-not-found.usecase.exception';
import { ReceiptsLimitExceededUsecaseException } from '../../exceptions/expense/receipts-limit-exceeded.usecase.exception';
import { ReceiptsNotProvidedUsecaseException } from '../../exceptions/expense/receipts-not-provided.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';

export type UpdateReceiptExpenseInput = {
  id: string;
  receipts: string[];
};

export type UpdateReceiptExpenseOutput = {
  receipts: number;
};

@Injectable()
export class UpdateReceiptExpenseUsecase
  implements Usecase<UpdateReceiptExpenseInput, UpdateReceiptExpenseOutput>
{
  private readonly logger = new Logger(UpdateReceiptExpenseUsecase.name);
  constructor(
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly eventGateway: EventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: UpdateReceiptExpenseInput,
  ): Promise<UpdateReceiptExpenseOutput> {
    const receipts = input.receipts;

    if (receipts.length <= 0) {
      throw new ReceiptsNotProvidedUsecaseException(
        'Attempt to update expense receipts without providing any receipt',
        'Nenhum comprovante foi enviado',
        UpdateReceiptExpenseUsecase.name,
      );
    }

    const expense = await this.eventExpensesGateway.findById(input.id);

    if (!expense) {
      throw new EventExpensesNotFoundUsecaseException(
        `Attempt to add new receipts but no expenses were found with the ID: ${input.id}`,
        `Nenhum gasto encontrado`,
        UpdateReceiptExpenseUsecase.name,
      );
    }

    // Valida limite de 3 antes de processar qualquer imagem
    const currentCount = expense.getImageUrls().length;
    if (currentCount + receipts.length > 3) {
      throw new ReceiptsLimitExceededUsecaseException(
        `Attempt to register new receipts but the limit was exceeded. The expense already has ${currentCount} registered, and ${receipts.length} more were being processed.`,
        `Limite de 3 comprovantes atingido, tente excluir alguns primeiro`,
        UpdateReceiptExpenseUsecase.name,
      );
    }

    const event = await this.eventGateway.findById(expense.getEventId());

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempt to add new receipts but no events matching ID: ${expense.getEventId()} were found.`,
        `Impossivel adicionar novo comprovante, pois não foi encontrado nenhum evento ligado ao gasto`,
        UpdateReceiptExpenseUsecase.name,
      );
    }

    const uploadedUrls = await this.processExpenseImages(
      receipts,
      expense,
      event,
    );

    expense.addImageUrls(uploadedUrls);

    // Busca todas as entradas de caixa relacionadas a este gasto
    const cashRegisterEntries =
      await this.cashRegisterEntryGateway.findByExpenseId(expense.getId());

    // Atualiza cada entrada de caixa com os novos comprovantes
    if (cashRegisterEntries && cashRegisterEntries.length > 0) {
      for (const cashRegisterEntry of cashRegisterEntries) {
        cashRegisterEntry.addImageUrls(uploadedUrls);
      }
      this.logger.log(
        `Atualizadas ${cashRegisterEntries.length} entrada(s) de caixa com novos comprovantes`,
      );
    } else {
      this.logger.warn(
        `Nenhum registro do caixa encontrado para o gasto ${expense.getId()}. Nenhuma entrada de caixa será atualizada com os novos comprovantes.`,
      );
    }

    await this.prisma.runInTransaction(async (tx) => {
      // Atualiza o gasto
      await this.eventExpensesGateway.updateTx(expense, tx);

      // Atualiza TODAS as entradas de caixa relacionadas
      if (cashRegisterEntries && cashRegisterEntries.length > 0) {
        for (const cashRegisterEntry of cashRegisterEntries) {
          await this.cashRegisterEntryGateway.updateTx(cashRegisterEntry, tx);
        }
      }
    });

    const output: UpdateReceiptExpenseOutput = {
      receipts: expense.getImageUrls().length,
    };

    return output;
  }

  private async processExpenseImages(
    images: string[],
    expense: EventExpenses,
    event: Event,
  ): Promise<string[]> {
    this.logger.log(`Processando ${images.length} imagem(ns) de comprovante`);

    const currentImageCount = expense.getImageUrls().length;
    const eventName = event.getName();
    const category = expense.getCategory();
    const value = expense.getValue();
    const description = expense.getDescription();

    const sanitizedEventName = sanitizeFileName(eventName || 'evento');
    const sanitizedCategoryName = sanitizeFileName(
      category || CategoryExpense.OUTROS,
    );
    const sanitizedDescription = generateExpenseSlug(
      description || 'descrição não encontrada',
    );
    const folderName = `expenses/${sanitizedEventName}/${sanitizedCategoryName}`;

    const filesOptions = await Promise.all(
      images.map(async (image, index) => {
        const { buffer, extension } =
          await this.imageOptimizerService.processBase64Image(image);

        const isValidImage = await this.imageOptimizerService.validateImage(
          buffer,
          `expense_${value}.${extension}`,
        );
        if (!isValidImage) {
          throw new InvalidImageFormatUsecaseException(
            'invalid image format',
            'Formato da imagem inválido',
            UpdateReceiptExpenseUsecase.name,
          );
        }

        const optimizedImage = await this.imageOptimizerService.optimizeImage(
          buffer,
          {
            maxWidth: 800,
            maxHeight: 800,
            quality: 70,
            format: 'webp',
            maxFileSize: 300 * 1024,
          },
        );

        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;

        // Calcula o índice real baseado na quantidade atual de imagens + o índice do novo array
        const realIndex = currentImageCount + index;
        const fileName = `${sanitizedDescription}_${value}_${formattedDateTime}_${realIndex}.${optimizedImage.format}`;

        return {
          folderName,
          fileName,
          fileBuffer: optimizedImage.buffer,
          contentType: this.imageOptimizerService.getMimeType(
            optimizedImage.format,
          ),
        };
      }),
    );

    return await this.supabaseStorageService.uploadFiles(filesOptions);
  }
}
