import { Injectable, Logger } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { InvalidImageFormatUsecaseException } from 'src/usecases/web/exceptions/payment/invalid-image-format.usecase.exception';

export type UpdateLogoEventInput = {
  eventId: string;
  image: string;
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

    const currentLogo = event.getLogoUrl();
    if (currentLogo && !currentLogo.startsWith('data:')) {
      this.logger.log(`Deletando logo anterior: ${currentLogo}`);
      await this.supabaseStorageService.deleteFile(currentLogo);
    }

    let logoUrl: string | undefined;
    if (input.image) {
      logoUrl = await this.processEventLogo(input.image, event.getName());
    }

    if (logoUrl) {
      event.updateLogoUrl(logoUrl);
    }

    await this.eventGateway.update(event);

    return { id: event.getId() };
  }

  private async processEventLogo(
    image: string,
    eventName: string,
  ): Promise<string> {
    this.logger.log('Processando logo do evento');

    try {
      const { buffer, extension } =
        await this.imageOptimizerService.processBase64Image(image);

      const safeEventName = eventName
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase();

      const isoDate = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0];

      const fileName = `${safeEventName}_logo_${isoDate}.${extension}`;

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

      const shouldKeepPng = extension.toLowerCase() === 'png';

      const optimizedImage = await this.imageOptimizerService.optimizeImage(
        buffer,
        {
          maxWidth: 500,
          maxHeight: 500,
          quality: 60,
          format: shouldKeepPng ? 'png' : 'webp',
          maxFileSize: 300 * 1024,
        },
      );

      const finalFileName = fileName.replace(
        /\.\w+$/,
        `.${optimizedImage.format}`,
      );

      const imageUrl = await this.supabaseStorageService.uploadFile({
        folderName: 'events',
        fileName: finalFileName,
        fileBuffer: optimizedImage.buffer,
        contentType: this.imageOptimizerService.getMimeType(
          optimizedImage.format,
        ),
      });

      try {
        await this.supabaseStorageService.calculateFolderSize('events');
      } catch (error) {
        this.logger.warn(
          `Não foi possível verificar o espaço usado: ${error.message}`,
        );
      }

      this.logger.log(`Logo do evento processado com sucesso: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      this.logger.error(`Erro ao processar logo do evento: ${error.message}`);

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
