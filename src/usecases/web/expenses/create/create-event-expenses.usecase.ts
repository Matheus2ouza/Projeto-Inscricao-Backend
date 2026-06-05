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
import { FinancialMovement } from 'src/domain/entities/financial-movement';
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

    const imagePaths = input.images?.length
      ? await Promise.all(
          input.images.map((image) =>
            this.processEventImage(
              image,
              event.getName(),
              input.category,
              input.value,
              input.description,
            ),
          ),
        )
      : [];

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

    const financialMovement = FinancialMovement.create({
      eventId: event.getId(),
      accountId: input.accountId,
      type: 'EXPENSE',
      value: new Decimal(expense.getValue()),
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

      // salva a nova movimentação
      await this.financialMovementGateway.createTx(financialMovement, tx);

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
        imageUrls: expense.getImageUrls(), /// como o registro do caixa aceita somente uma imagem, passamos somente a primeira
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

  private async processEventImage(
    image: string,
    eventName: string,
    category: string,
    value: number,
    description: string,
  ): Promise<string> {
    this.logger.log('Processando imagem do evento');

    const { buffer, extension } =
      await this.imageOptimizerService.processBase64Image(image);

    // Valida a imagem
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

    // Otimiza imagem (ex: converte para webp e reduz tamanho)
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

    // Sanitiza os dados para evitar caracteres inválidos no Supabase
    const sanitizedEventName = sanitizeFileName(eventName || 'evento');
    const sanitizedCategoryName = sanitizeFileName(
      category || CategoryExpense.OUTROS,
    );
    const sanitizedDescription = generateExpenseSlug(
      description || 'descrição não encontrada',
    );

    // Cria nome do arquivo
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
    const fileName = `${sanitizedDescription}_${value}_${formattedDateTime}.${optimizedImage.format}`;

    // Define a pasta com base no evento e no responsável pelo gasto
    const folderName = `expenses/${sanitizedEventName}/${sanitizedCategoryName}`;

    // Faz upload no Supabase
    const imageUrl = await this.supabaseStorageService.uploadFile({
      folderName: folderName,
      fileName: fileName,
      fileBuffer: optimizedImage.buffer,
      contentType: this.imageOptimizerService.getMimeType(
        optimizedImage.format,
      ),
    });

    return imageUrl;
  }
}
