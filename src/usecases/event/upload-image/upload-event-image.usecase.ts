import { Injectable, Logger } from '@nestjs/common';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from '../../usecase';

export interface UploadEventImageDto {
  eventId: string;
  fileBuffer: Buffer;
  originalName: string;
  contentType: string;
}

export interface UploadEventImageResult {
  imageUrl: string;
  eventId: string;
}

@Injectable()
export class UploadEventImageUsecase
  implements Usecase<UploadEventImageDto, UploadEventImageResult>
{
  private readonly logger = new Logger(UploadEventImageUsecase.name);

  constructor(
    private readonly eventGateway: EventGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
  ) {}

  async execute(dto: UploadEventImageDto): Promise<UploadEventImageResult> {
    try {
      this.logger.log(`Iniciando upload de imagem para evento: ${dto.eventId}`);

      // 1. Valida se o evento existe
      const event = await this.eventGateway.findById(dto.eventId);
      if (!event) {
        this.logger.warn(`Evento não encontrado: ${dto.eventId}`);
        throw new Error('Evento não encontrado');
      }

      // 2. Valida a imagem
      const isValidImage = await this.imageOptimizerService.validateImage(
        dto.fileBuffer,
        dto.originalName,
      );
      if (!isValidImage) {
        this.logger.warn(`Imagem inválida para evento: ${dto.eventId}`);
        throw new Error(
          'Arquivo não é uma imagem válida ou excede o tamanho máximo permitido',
        );
      }

      // 3. Otimiza a imagem
      this.logger.log(`Otimizando imagem para evento: ${dto.eventId}`);
      const optimizedImage = await this.imageOptimizerService.optimizeImage(
        dto.fileBuffer,
        {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 85,
          format: 'webp',
        },
      );

      // 4. Gera nome único para o arquivo
      const fileName = this.imageOptimizerService.generateUniqueFileName(
        dto.originalName,
        optimizedImage.format,
      );

      // 5. Faz upload para o Supabase Storage
      this.logger.log(`Fazendo upload para Supabase Storage: ${fileName}`);
      const imageUrl = await this.supabaseStorageService.uploadFile({
        folderName: 'events',
        fileName,
        fileBuffer: optimizedImage.buffer,
        contentType: this.imageOptimizerService.getMimeType(
          optimizedImage.format,
        ),
      });

      // 6. Atualiza o evento com a URL da imagem
      this.logger.log(`Atualizando evento com URL da imagem: ${imageUrl}`);
      event.setImageUrl(imageUrl);
      await this.eventGateway.update(event);

      this.logger.log(
        `Upload de imagem concluído com sucesso para evento: ${dto.eventId}`,
      );

      return {
        imageUrl,
        eventId: dto.eventId,
      };
    } catch (error) {
      this.logger.error(
        `Erro no upload de imagem para evento ${dto.eventId}: ${error.message}`,
      );
      throw error;
    }
  }
}
