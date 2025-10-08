import { Injectable, Logger } from '@nestjs/common';
import { Event } from 'src/domain/entities/event.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { missingStartDateOrEndDateUsecaseException } from 'src/usecases/exceptions/events/missing-start-date-or-end-date.usecase.exception';
import { InvalidEventDateRangeUsecaseException } from 'src/usecases/exceptions/events/invalid-event-date-range.usecase.exception';
import { MissingRegionIdUsecaseException } from 'src/usecases/exceptions/events/missing-region-id.usecase.exception';
import { InvalidImageFormatUsecaseException } from 'src/usecases/exceptions/events/invalid-image-format.usecase.exception';
import { RegionNotFoundUsecaseException } from 'src/usecases/exceptions/users/region-not-found.usecase.exception';
import { Usecase } from 'src/usecases/usecase';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { ImageOptimizerService } from 'src/infra/services/image-optimizer/image-optimizer.service';
import { EventNameAlreadyExistsUsecaseException } from 'src/usecases/exceptions/events/event-name-already-exists.usecase.exception';
import { statusEvent } from 'generated/prisma';

export type CreateEventInput = {
  name: string;
  startDate: Date;
  endDate: Date;
  regionId: string;
  image?: string;
  location?: string;
  longitude?: number;
  latitude?: number;
  status: statusEvent;
};

export type CreateEventOutput = {
  id: string;
};

@Injectable()
export class CreateEventUseCase
  implements Usecase<CreateEventInput, CreateEventOutput>
{
  private readonly logger = new Logger(CreateEventUseCase.name);

  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly regionGateway: RegionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
  ) {}

  public async execute({
    name,
    startDate,
    endDate,
    regionId,
    image,
    location,
    longitude,
    latitude,
    status,
  }: CreateEventInput): Promise<CreateEventOutput> {
    if (!regionId) {
      throw new MissingRegionIdUsecaseException(
        'RegionId is missing',
        'Região não informada',
        CreateEventUseCase.name,
      );
    }

    if (!startDate || !endDate) {
      throw new missingStartDateOrEndDateUsecaseException(
        `Start date and/or end date is missing`,
        `Data de início e/ou data de término está faltando`,
        CreateEventUseCase.name,
      );
    }

    if (startDate > endDate) {
      throw new InvalidEventDateRangeUsecaseException(
        'Start date is after end date',
        'A data de início não pode ser posterior à data de término',
        CreateEventUseCase.name,
      );
    }

    // Verifica se já existe evento com o mesmo nome na mesma região
    const existingEvent = await this.eventGateway.findByNameAndRegionId(
      name,
      regionId,
    );
    if (existingEvent) {
      throw new EventNameAlreadyExistsUsecaseException(
        `Event with name ${name} already exists in region ${regionId}`,
        `Já existe um evento com esse nome nesta região`,
        CreateEventUseCase.name,
      );
    }

    const regionExists = await this.regionGateway.findById(regionId);
    if (!regionExists) {
      throw new RegionNotFoundUsecaseException(
        `Region with id ${regionId} does not exist`,
        `A região com id ${regionId} não existe`,
        CreateEventUseCase.name,
      );
    }

    // Processa a imagem se fornecida
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.processEventImage(image, name);
    }

    const event = Event.create({
      name: name,
      startDate: startDate,
      endDate: endDate,
      regionId: regionId,
      imageUrl: imageUrl,
      location: location,
      longitude: longitude,
      latitude: latitude,
      status: status,
    });

    await this.eventGateway.create(event);

    const output: CreateEventOutput = {
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
      const { buffer, extension, originalName } =
        await this.imageOptimizerService.processBase64Image(image);

      // Gera nome baseado no evento
      const slug = this.generateSlug(eventName);
      const fileName = `${slug}_${Date.now()}.${extension}`;

      // Valida a imagem
      const isValidImage = await this.imageOptimizerService.validateImage(
        buffer,
        fileName,
      );

      if (!isValidImage) {
        throw new InvalidImageFormatUsecaseException(
          'image file is not valid or exceeds the maximum allowed size',
          'Arquivo não é uma imagem válida ou excede o tamanho máximo permitido',
          CreateEventUseCase.name,
        );
      }

      // Otimiza a imagem para webp com tamanho máximo de 300KB para economizar espaço no Supabase
      const optimizedImage = await this.imageOptimizerService.optimizeImage(
        buffer,
        {
          maxWidth: 1200,
          maxHeight: 800,
          quality: 60, // Qualidade mais baixa para menor tamanho
          format: 'webp',
          maxFileSize: 300 * 1024, // 300KB - muito menor para economizar espaço
        },
      );

      // Gera nome único para o arquivo final
      const finalFileName = this.imageOptimizerService.generateUniqueFileName(
        fileName,
        optimizedImage.format,
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
        CreateEventUseCase.name,
      );
    }
  }

  /**
   * Gera um slug a partir do nome do evento
   * @param name - Nome do evento
   * @returns Slug gerado
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
