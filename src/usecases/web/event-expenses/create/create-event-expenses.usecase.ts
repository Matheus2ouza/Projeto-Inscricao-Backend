import { Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import {
  CashEntryOrigin,
  CashEntryType,
  CategoryExpense,
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
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
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
  image: string;
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

    let imageUrl;
    if (input.image) {
      imageUrl = await this.processEventImage(
        input.image,
        event.getName(),
        input.value,
        input.responsible,
      );
    }

    const eventExpense = EventExpenses.create({
      eventId: event.getId(),
      description: input.description,
      value: input.value,
      paymentMethod: input.paymentMethod,
      responsible: input.responsible,
      category: input.category,
      imageUrl,
      createdAt: input.createAt,
    });

    const expense = await this.eventExpensesGateway.create(eventExpense);

    const financialMovement = FinancialMovement.create({
      eventId: event.getId(),
      accountId: input.accountId,
      type: 'EXPENSE',
      value: new Decimal(expense.getValue()),
      createdAt: input.createAt,
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
          favorite: true,
          value: expense.getValue(),
          description: expense.getDescription(),
          eventId: event.getId(),
          eventExpenseId: expense.getId(),
          responsible: expense.getResponsible(),
          createAt: input.createAt,
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

  private async processEventImage(
    image: string,
    eventName: string,
    value: number,
    responsible: string,
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
        maxFileSize: 300 * 1024, // 300KB
      },
    );

    // Sanitiza o nome do evento para evitar caracteres inválidos no Supabase
    const sanitizedEventName = sanitizeFileName(eventName || 'evento');

    // Sanitiza o responsável pelo gasto para evitar caracteres inválidos no Supabase
    const sanitizedResponsible = sanitizeFileName(responsible || 'responsavel');

    // Cria nome do arquivo: payment+valor+hora formatada
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
    const fileName = `expense_${sanitizedResponsible}_${value}_${formattedDateTime}.${optimizedImage.format}`;

    // Define a pasta com base no evento e no responsável pelo gasto
    const folderName = `expenses/${sanitizedEventName}/${sanitizedResponsible}`;

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
