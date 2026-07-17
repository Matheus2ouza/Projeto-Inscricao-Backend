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

export type UpdateLogoEventInput = {
  eventId: string;
  file: {
    buffer: Buffer;
    mimeType: string;
  };
};

export type UpdateLogoEventOutput = {
  id: string;
};

@Injectable()
export class UpdateLogoEventUsecase
  implements Usecase<UpdateLogoEventInput, UpdateLogoEventOutput>
{
  private readonly logger = new Logger(UpdateLogoEventUsecase.name);

  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
  ) {}

  public async execute(
    input: UpdateLogoEventInput,
  ): Promise<UpdateLogoEventOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId} in ${UpdateLogoEventUsecase.name}`,
        `Evento não encontrado`,
        UpdateLogoEventUsecase.name,
      );
    }

    if (!input.file) {
      return { id: event.getId() };
    }

    const oldLogo = event.getLogoUrl();

    // processa e sobe a logo primeiro
    const logoUrl = await this.processEventLogo(input.file, event.getName());

    // atualiza os dados após o upload já estar confirmado
    event.setLogoUrl(logoUrl);
    await this.eventGateway.update(event);

    // dispara a limpeza da logo antiga em background, sem bloquear a resposta
    if (oldLogo) {
      void this.deleteOldLogo(oldLogo);
    }

    return { id: event.getId() };
  }

  private async deleteOldLogo(oldLogo: string): Promise<void> {
    const maxAttempts = 3;
    const delaysMs = [500, 1000, 2000];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.supabaseStorageService.deleteFile(oldLogo);
        return;
      } catch (error) {
        const err = error as Error;

        if (attempt === maxAttempts) {
          this.logger.warn(
            `Não foi possível remover a logo antiga (${oldLogo}) após ${maxAttempts} tentativas: ${err.message}`,
          );
          return;
        }

        this.logger.warn(
          `Falha ao remover logo antiga (tentativa ${attempt}/${maxAttempts}): ${err.message}. Tentando novamente em ${delaysMs[attempt - 1]}ms...`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, delaysMs[attempt - 1]),
        );
      }
    }
  }

  private async processEventLogo(
    file: { buffer: Buffer; mimeType: string },
    eventName: string,
  ): Promise<string> {
    this.logger.log('Processando logo do evento');

    try {
      // extrai extensão a partir do mimeType
      const extension = file.mimeType.split('/')[1] ?? 'png';
      const buffer = file.buffer;

      // Sanitiza o nome do evento para evitar caracteres inválidos no Supabase
      const sanitizedEventName = sanitizeFileName(eventName || 'evento');

      // Cria nome do arquivo: logo_event + nome do evento + hora formatada
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');

      const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
      const fileName = `logo_event_${sanitizedEventName}_${formattedDateTime}.${extension}`;

      const isValidImage = await this.imageOptimizerService.validateImage(
        buffer,
        fileName,
      );

      if (!isValidImage) {
        throw new InvalidImageFormatUsecaseException(
          'image file is not valid or exceeds the maximum allowed size',
          'Arquivo não é uma imagem válida ou excede o tamanho máximo permitido',
          UpdateLogoEventUsecase.name,
        );
      }

      const optimizedImage = await this.imageOptimizerService.optimizeImage(
        buffer,
        IMAGE_OPTIMIZATION_PRESETS.logo,
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

      this.logger.log(`Logo do evento processado com sucesso: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Erro ao processar logo do evento: ${err.message}`);

      if (error instanceof InvalidImageFormatUsecaseException) {
        throw error;
      }

      throw new InvalidImageFormatUsecaseException(
        'Failed to process event logo',
        'Falha ao processar logo do evento',
        UpdateLogoEventUsecase.name,
      );
    }
  }
}
