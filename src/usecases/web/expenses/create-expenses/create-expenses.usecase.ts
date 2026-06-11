import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  CashEntryOrigin,
  CashEntryType,
  CategoryExpense,
  PaymentMethod,
} from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import { EventExpenses } from 'src/domain/entities/event-expenses.entity';
import { Event } from 'src/domain/entities/event.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterEventGateway } from 'src/domain/repositories/cash-register-event.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventExpensesGateway } from 'src/domain/repositories/event-expenses.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { FinancialMovementGateway } from 'src/domain/repositories/financial-movement.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { generateExpenseSlug } from 'src/shared/utils/expense-file-name.util';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { ImageLimitExceededUsecaseException } from '../../exceptions/image-limit-exceeded.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';

export type CreateExpensesInput = {
  accountId: string;
  eventId: string;
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  category: CategoryExpense;
  images: string[];
  createAt?: Date;
};

export type CreateExpensesOutput = {
  id: string;
};

@Injectable()
export class CreateExpensesUsecase
  implements Usecase<CreateExpensesInput, CreateExpensesOutput>
{
  private readonly logger = new Logger(CreateExpensesUsecase.name);
  public constructor(
    private readonly eventExpensesGateway: EventExpensesGateway,
    private readonly eventGateway: EventGateway,
    private readonly cashRegisterEventGateway: CashRegisterEventGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly financialMovementGateway: FinancialMovementGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: CreateExpensesInput): Promise<CreateExpensesOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempt to register event expense but Event was not found, eventId: ${input.eventId}`,
        `Evento não encontrado`,
        CreateExpensesUsecase.name,
      );
    }

    let imagePaths: string[] = [];
    if (input.images.length > 0) {
      if (input.images.length > 3) {
        throw new ImageLimitExceededUsecaseException(
          `Attempting to register expenses with more receipts than allowed: ${input.images.length}`,
          `Limite de 3 comprovantes atingido`,
          CreateExpensesUsecase.name,
        );
      }

      imagePaths = await this.processExpenseImages(
        input.images,
        event,
        input.category,
        input.value,
        input.responsible,
        input.description,
        0, // como ainda não existe nem o gasto ainda, então passamos o currentImageCount como zero
      );
    }

    const expense = EventExpenses.create({
      eventId: event.getId(),
      description: input.description,
      value: input.value,
      paymentMethod: input.paymentMethod,
      responsible: input.responsible,
      category: input.category,
      imageUrls: imagePaths,
      createdAt: input.createAt,
    });

    // preparar dados de caixa
    const cashRegisterEvents =
      await this.cashRegisterEventGateway.findByEventId(expense.getEventId());
    const cashRegisterEntries = this.buildCashRegisterEntries(
      cashRegisterEvents,
      expense,
    );
    const updatedCashRegisters = cashRegisterEntries.length
      ? await this.buildUpdatedCashRegisters(cashRegisterEntries)
      : [];

    // atualiza o valor gasto do evento com a nova saida
    event.incrementAmountSpent(expense.getValue());

    // abre a transaction para salvar no banco
    await this.prisma.runInTransaction(async (tx) => {
      // salva o gasto
      await this.eventExpensesGateway.createTx(expense, tx);

      // se encontrar caixa referente ao evento, então cria as entradas e atualiza o caixa
      if (cashRegisterEntries.length) {
        await this.cashRegisterEntryGateway.createManyTx(
          cashRegisterEntries,
          tx,
        );

        for (const cashRegister of updatedCashRegisters) {
          await this.cashRegisterGateway.updateTx(cashRegister, tx);
        }
      } else {
        this.logger.warn(
          `Nenhum caixa encontrado para o evento ${expense.getEventId()}`,
        );
      }

      await this.eventGateway.updateTx(event, tx);
    });

    const output: CreateExpensesOutput = {
      id: expense.getId(),
    };
    return output;
  }

  private buildCashRegisterEntries(
    cashRegisterEvents: CashRegisterEvent[],
    expense: EventExpenses,
  ): CashRegisterEntry[] {
    return cashRegisterEvents.map((cashRegisterEvent) =>
      CashRegisterEntry.create({
        cashRegisterId: cashRegisterEvent.getCashRegisterId(),
        type: CashEntryType.EXPENSE,
        origin: CashEntryOrigin.EXPENSE,
        method: expense.getPaymentMethod(),
        value: expense.getValue(),
        description: expense.getDescription(),
        eventId: expense.getEventId(),
        eventExpenseId: expense.getId(),
        responsible: expense.getResponsible(),
        imageUrls: expense.getImageUrls(),
      }),
    );
  }

  private async buildUpdatedCashRegisters(
    entries: CashRegisterEntry[],
  ): Promise<CashRegister[]> {
    const deltaMap = new Map<string, Decimal>();
    for (const entry of entries) {
      const id = entry.getCashRegisterId();
      const current = deltaMap.get(id) ?? new Decimal(0);
      deltaMap.set(id, current.add(entry.getValue()));
    }

    const updated: CashRegister[] = [];
    for (const [cashRegisterId, delta] of deltaMap.entries()) {
      if (delta.isZero()) continue;
      const cashRegister =
        await this.cashRegisterGateway.findById(cashRegisterId);
      if (!cashRegister) continue;
      cashRegister.decrementBalance(delta.toNumber());
      updated.push(cashRegister);
    }
    return updated;
  }

  private async processExpenseImages(
    images: string[],
    event: Event,
    category: string,
    value: number,
    responsible: string,
    description: string,
    currentImageCount: number,
  ): Promise<string[]> {
    this.logger.log(`Processando ${images.length} imagem(ns) de comprovante`);

    const eventName = event.getName();
    const sanitizedEventName = sanitizeFileName(eventName || 'evento');
    const sanitizedCategoryName = sanitizeFileName(
      category || CategoryExpense.OUTROS,
    );
    const sanitizedResponsibleName = sanitizeFileName(responsible);
    const sanitizedDescription = generateExpenseSlug(
      description || 'descrição não encontrada',
    );
    const folderName = `expenses/${sanitizedEventName}/${sanitizedCategoryName}/${sanitizedResponsibleName}`;

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
            CreateExpensesUsecase.name,
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

        // Para criação, currentImageCount é 0, então o índice real é igual ao index
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
