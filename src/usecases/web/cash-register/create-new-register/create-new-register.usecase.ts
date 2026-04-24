import { Injectable, Logger } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
} from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { Event } from 'src/domain/entities/event.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { CashRegisterNotFoundUsecaseException } from '../../exceptions/cash-register/cash-register-not-found.usecase.exception';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';

export type CreateNewRegisterInput = {
  cashRegisterId: string;
  type: CashEntryType;
  method: PaymentMethod;
  value: number;
  description?: string;
  eventId: string;
  responsible: string;
  image?: string;
};

export type CreateNewRegisterOutput = {
  id: string;
};

@Injectable()
export class CreateNewRegisterUsecase
  implements Usecase<CreateNewRegisterInput, CreateNewRegisterOutput>
{
  private readonly logger = new Logger(CreateNewRegisterUsecase.name);
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: CreateNewRegisterInput,
  ): Promise<CreateNewRegisterOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempt to create cash register entry but Event was not found, eventId: ${input.eventId}`,
        `Nenhum evento encontrado`,
        CreateNewRegisterUsecase.name,
      );
    }

    const cashRegister = await this.cashRegisterGateway.findById(
      input.cashRegisterId,
    );

    if (!cashRegister) {
      throw new CashRegisterNotFoundUsecaseException(
        `Attempt to create cash register entry but Cash Register was not found, cashRegisterId: ${input.cashRegisterId}`,
        `Nenhum caixa encontrado`,
        CreateNewRegisterUsecase.name,
      );
    }

    let imagePath: string | undefined = undefined;

    if (input.image) {
      // Processamento da imagem
      imagePath = await this.processEventImage(
        input.image,
        event,
        input.value,
        input.responsible,
      );
    }

    const cashRegisterEntry = CashRegisterEntry.create({
      cashRegisterId: cashRegister.getId(),
      type: input.type,
      origin: CashEntryOrigin.MANUAL,
      method: input.method,
      value: input.value,
      description: input.description,
      eventId: event.getId(),
      responsible: input.responsible,
      imageUrl: imagePath,
    });

    if (cashRegisterEntry.getType() === CashEntryType.INCOME) {
      cashRegister.incrementBalance(cashRegisterEntry.getValue());
    }

    if (cashRegisterEntry.getType() === CashEntryType.EXPENSE) {
      cashRegister.decrementBalance(cashRegisterEntry.getValue());
    }

    await this.prisma.runInTransaction(async (tx) => {
      await this.cashRegisterEntryGateway.createTx(cashRegisterEntry, tx);
      await this.cashRegisterGateway.updateTx(cashRegister, tx);
    });

    const output: CreateNewRegisterOutput = {
      id: cashRegisterEntry.getId(),
    };

    return output;
  }

  private async processEventImage(
    image: string,
    event: Event,
    value: number,
    responsible: string,
  ): Promise<string> {
    this.logger.log('Processando imagem do recibo');

    const { buffer, extension } =
      await this.imageOptimizerService.processBase64Image(image);

    const isValidImage = await this.imageOptimizerService.validateImage(
      buffer,
      `receipt_${value}.${extension}`,
    );
    if (!isValidImage) {
      throw new InvalidImageFormatUsecaseException(
        'invalid image format',
        'Formato da imagem inválido',
        CreateNewRegisterUsecase.name,
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

    const sanitizedEventName = sanitizeFileName(event?.getName() || 'evento');
    const sanitizedResponsible = sanitizeFileName(responsible);

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;

    const fileName = `receipt_${sanitizedResponsible}_${value}_${formattedDateTime}.${optimizedImage.format}`;
    const folderName = `receipts/${sanitizedEventName}/${sanitizedResponsible}`;

    const imageUrl = await this.supabaseStorageService.uploadFile({
      folderName,
      fileName,
      fileBuffer: optimizedImage.buffer,
      contentType: this.imageOptimizerService.getMimeType(
        optimizedImage.format,
      ),
    });

    return imageUrl;
  }
}
