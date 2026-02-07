import { Injectable, Logger } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { InvalidImageFormatUsecaseException } from 'src/usecases/web/exceptions/payment/invalid-image-format.usecase.exception';

export type UpdateImageEventInput = {
  eventId: string;
  image: string;
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

    const asImage = event.getImageUrl();
    if (asImage) {
      this.logger.log(`Deletando imagem anterior: ${asImage}`);
      await this.supabaseStorageService.deleteFile(asImage);
    }

    // Processa a imagem se fornecida
    let imageUrl: string | undefined;
    if (input.image) {
      imageUrl = await this.processEventImage(input.image, event.getName());
    }

    if (imageUrl) {
      event.updateImage(imageUrl);
    }

    await this.eventGateway.update(event);

    const output: UpdateImageEventOutput = {
      id: event.getId(),
    };

    return output;
  }

  /**
   * Processa a imagem do evento: valida, otimiza e faz upload
   * @param image - Data URL base64 da imagem
   * @param eventName - Nome do evento para gerar nome do arquivo
   * @returns URL da imagem no Supabase Storage
   */
  private async processEventImage(
    image: string,
    eventName: string,
  ): Promise<string> {
    this.logger.log('Processando imagem do evento');

    try {
      // Processa a imagem base64
      const { buffer, extension } =
        await this.imageOptimizerService.processBase64Image(image);

      // Gera nome baseado no evento com data em formato ISO
      // Limpa o nome do evento para ser seguro como nome de arquivo
      const safeEventName = eventName
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífen
        .toLowerCase();
      // Formata a data ISO removendo caracteres especiais para usar em nome de arquivo
      const isoDate = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .split('.')[0];
      const fileName = `${safeEventName}_${isoDate}.${extension}`;

      // Valida a imagem
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

      // Otimiza a imagem para webp com tamanho máximo de 300KB para economizar espaço no Supabase
      const optimizedImage = await this.imageOptimizerService.optimizeImage(
        buffer,
        {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 60,
          format: 'webp',
          maxFileSize: 300 * 1024, // 300KB - muito menor para economizar espaço
        },
      );

      // Substitui a extensão pelo formato otimizado (webp)
      const finalFileName = fileName.replace(
        /\.\w+$/,
        `.${optimizedImage.format}`,
      );

      // Faz upload para o Supabase Storage
      const imageUrl = await this.supabaseStorageService.uploadFile({
        folderName: 'events',
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
        this.logger.warn(
          `Não foi possível verificar o espaço usado: ${error.message}`,
        );
      }

      this.logger.log(`Imagem do evento processada com sucesso: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      this.logger.error(`Erro ao processar imagem do evento: ${error.message}`);

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
