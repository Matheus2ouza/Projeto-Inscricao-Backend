import { Injectable, Logger } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
} from 'generated/prisma';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import { Event } from 'src/domain/entities/event/event.entity';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { generateSlug } from 'src/shared/utils/generate-slug';
import { Usecase } from 'src/usecases/usecase';
import { CashRegisterNotFoundUsecaseException } from '../../exceptions/cash-register/cash-register-not-found.usecase.exception';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { ImageLimitExceededUsecaseException } from '../../exceptions/image-limit-exceeded.usecase.exception';
import { InvalidImageFormatUsecaseException } from '../../exceptions/payment/invalid-image-format.usecase.exception';

export type CreateNewRegisterInput = {
  cashRegisterId: string;
  type: CashEntryType;
  method: PaymentMethod;
  favorite?: boolean;
  value: number;
  description: string;
  eventId: string;
  responsible: string;
  images: string[];
  createAt?: Date;
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

    let imagePaths: string[] = [];
    if (input.images.length > 0) {
      if (input.images.length > 3) {
        throw new ImageLimitExceededUsecaseException(
          `Attempting to register expenses with more receipts than allowed: ${input.images.length}`,
          `Limite de 3 comprovantes atingido`,
          CreateNewRegisterUsecase.name,
        );
      }

      imagePaths = await this.processExpenseImages(
        input.images,
        event,
        input.type,
        input.method,
        input.responsible,
        input.description,
        input.value,
        0, // como o registro ainda não foi criado então passamos zero como index
      );
    }

    const cashRegisterEntry = CashRegisterEntry.create({
      cashRegisterId: cashRegister.getId(),
      type: input.type,
      origin: CashEntryOrigin.MANUAL,
      method: input.method,
      favorite: input.favorite,
      value: input.value,
      description: input.description,
      eventId: event.getId(),
      responsible: input.responsible,
      imageUrls: imagePaths,
      createAt: input.createAt,
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

  private async processExpenseImages(
    images: string[],
    event: Event,
    type: CashEntryType,
    method: PaymentMethod,
    responsible: string,
    description: string,
    value: number,
    currentImageCount: number,
  ): Promise<string[]> {
    this.logger.log('Processando imagem do recibo');

    const eventName = event.getName();
    const sanitizedEventName = sanitizeFileName(eventName || 'evento');
    const sanitizedtypeName = sanitizeFileName(type);
    const sanitizedMethodName = sanitizeFileName(method);
    const sanitizedResponsibleName = sanitizeFileName(responsible);
    const sanitizedDescription = generateSlug({
      description,
      defaultSlug: 'receipt',
    });
    const folderName = `receipts/${sanitizedEventName}/${sanitizedtypeName}/${sanitizedMethodName}/${sanitizedResponsibleName}`;

    const filesOptions = await Promise.all(
      images.map(async (image, index) => {
        const { buffer, extension } =
          await this.imageOptimizerService.processBase64Image(image);

        const isValidImage = await this.imageOptimizerService.validateImage(
          buffer,
          `receipts${value}.${extension}`,
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
