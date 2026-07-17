import { Injectable, Logger } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import {
  IMAGE_OPTIMIZATION_PRESETS,
  ImageOptimizerService,
} from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { InvalidImageFormatUsecaseException } from 'src/usecases/web/exceptions/payment/invalid-image-format.usecase.exception';

export type UpdateImageEventInput = {
  eventId: string;
  file: {
    buffer: Buffer;
    mimeType: string;
  };
};

export type UpdateImageEventOutput = {
  id: string;
};

@Injectable()
export class UpdateImageEventUsecase
  implements Usecase<UpdateImageEventInput, UpdateImageEventOutput>
{
  private readonly logger = new Logger(UpdateImageEventUsecase.name);

  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
  ) {}

  public async execute(
    input: UpdateImageEventInput,
  ): Promise<UpdateImageEventOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId} in ${UpdateImageEventUsecase.name}`,
        `Evento não encontrado`,
        UpdateImageEventUsecase.name,
      );
    }

    if (!input.file) {
      return { id: event.getId() };
    }

    const oldImage = event.getImageUrl();

    // processa e sobe a imagem primeiro
    const imageUrl = await this.processEventImage(input.file, event.getName());

    // atualiza os dados após o upload já estar confirmado
    event.setImageUrl(imageUrl);
    await this.eventGateway.update(event);

    // dispara a limpeza da imagem antiga em background, sem bloquear a resposta
    if (oldImage) {
      void this.deleteOldImage(oldImage);
    }

    return { id: event.getId() };
  }

  private async deleteOldImage(oldImage: string): Promise<void> {
    const maxAttempts = 3;
    const delaysMs = [500, 1000, 2000];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.supabaseStorageService.deleteFile(oldImage);
        return;
      } catch (error) {
        const err = error as Error;

        if (attempt === maxAttempts) {
          this.logger.warn(
            `Não foi possível remover a imagem antiga (${oldImage}) após ${maxAttempts} tentativas: ${err.message}`,
          );
          return;
        }

        this.logger.warn(
          `Falha ao remover imagem antiga (tentativa ${attempt}/${maxAttempts}): ${err.message}. Tentando novamente em ${delaysMs[attempt - 1]}ms...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, delaysMs[attempt - 1]),
        );
      }
    }
  }

  private async processEventImage(
    file: { buffer: Buffer; mimeType: string },
    eventName: string,
  ): Promise<string> {
    this.logger.log('Processando imagem do evento');

    try {
      // Extrai extensão a partir do mimeType
      const extension = file.mimeType.split('/')[1] ?? 'png';
      const buffer = file.buffer;

      // Sanitiza o nome do evento para evitar caracteres inválidos no Supabase
      const sanitizedEventName = sanitizeFileName(eventName || 'evento');

      // Cria nome do arquivo: capa_event + nome do evento + hora formatada
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
      const fileName = `capa_event_${sanitizedEventName}_${formattedDateTime}.${extension}`;

      const isValidImage = await this.imageOptimizerService.validateImage(
        buffer,
        fileName,
      );

      if (!isValidImage) {
        throw new InvalidImageFormatUsecaseException(
          'image file is not valid or exceeds the maximum allowed size',
          'Arquivo não é uma imagem válida ou excede o tamanho máximo permitido',
          UpdateImageEventUsecase.name,
        );
      }

      const optimizedImage = await this.imageOptimizerService.optimizeImage(
        buffer,
        IMAGE_OPTIMIZATION_PRESETS.mediumQuality,
      );

      // Substitui a extensão pelo formato otimizado (webp)
      const finalFileName = fileName.replace(
        /\.\w+$/,
        `.${optimizedImage.format}`,
      );

      // Define a pasta como events/nome-do-evento
      const folderName = `events/${sanitizedEventName}`;

      const imageUrl = await this.supabaseStorageService.uploadFile({
        folderName: folderName,
        fileName: finalFileName,
        fileBuffer: optimizedImage.buffer,
        contentType: this.imageOptimizerService.getMimeType(
          optimizedImage.format,
        ),
      });

      // Verifica o espaço usado após o upload
      try {
        await this.supabaseStorageService.calculateFolderSize('events');
      } catch (error) {
        const err = error as Error;
        this.logger.warn(
          `Não foi possível verificar o espaço usado: ${err.message}`,
        );
      }

      this.logger.log(`Imagem do evento processada com sucesso: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao processar imagem do evento: ${err.message}`);

      if (error instanceof InvalidImageFormatUsecaseException) {
        throw error;
      }

      throw new InvalidImageFormatUsecaseException(
        'Failed to process event image',
        'Falha ao processar imagem do evento',
        UpdateImageEventUsecase.name,
      );
    }
  }
}
