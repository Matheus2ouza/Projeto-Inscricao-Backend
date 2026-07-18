import { Injectable, Logger } from '@nestjs/common';
import { InscriptionMode, PaymentMode, statusEvent } from 'generated/prisma';
import { EventResponsible } from 'src/domain/entities/event-responsibles.entity';
import { Event } from 'src/domain/entities/event/event.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventResponsibleGateway } from 'src/domain/repositories/event-responsible.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { RegionGateway } from 'src/domain/repositories/region.gateway';
import { ParticipantFieldsConfig } from 'src/domain/shared/types/participant-fields-config.type';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import {
  IMAGE_OPTIMIZATION_PRESETS,
  ImageOptimizerService,
} from 'src/infra/services/image-optimizer/image-optimizer.service';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { sanitizeFileName } from 'src/shared/utils/file-name.util';
import { Usecase } from 'src/usecases/usecase';
import { RegionNotFoundUsecaseException } from 'src/usecases/web/exceptions/accounts/region-not-found.usecase.exception';
import { EventNameAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/events/event-name-already-exists.usecase.exception';
import { InvalidImageFormatUsecaseException } from 'src/usecases/web/exceptions/payment/invalid-image-format.usecase.exception';
import { AccountNotFoundUsecaseException } from '../../exceptions/accounts/account-not-found.usecase.exception';

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
  allowedInscriptionModes: InscriptionMode[];
  allowedPaymentModes: PaymentMode[];
  participantFieldsConfig?: ParticipantFieldsConfig;
  paymentEnabled: boolean;
  responsibles: {
    accountId: string;
  }[];
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
    private readonly accountGateway: AccountGateway,
    private readonly eventResponsibleGateway: EventResponsibleGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
    private readonly imageOptimizerService: ImageOptimizerService,
    private readonly prisma: PrismaService,
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
    allowedInscriptionModes,
    allowedPaymentModes,
    participantFieldsConfig,
    paymentEnabled,
    responsibles,
  }: CreateEventInput): Promise<CreateEventOutput> {
    const region = await this.regionGateway.findById(regionId);

    if (!region) {
      throw new RegionNotFoundUsecaseException(
        `Tentativa de criar um evento mas o id passado: ${regionId} não é referente a nenhuma região`,
        `Região a qual o evento refere-se é invalida ou inexistente`,
        CreateEventUseCase.name,
      );
    }

    // Verifica se já existe evento com o mesmo nome na mesma região
    const existingEvent = await this.eventGateway.findByNameAndRegionId(
      name,
      region.getId(),
    );

    if (existingEvent) {
      throw new EventNameAlreadyExistsUsecaseException(
        `Event with name ${name} already exists in region ${regionId}`,
        `Já existe um evento com esse nome nesta região`,
        CreateEventUseCase.name,
      );
    }

    const existingIds = new Set<string>();
    if (responsibles && responsibles.length > 0) {
      const accountIds = responsibles.map((r) => r.accountId);
      const existingAccounts =
        await this.accountGateway.findEligibleResponsibles(accountIds);
      existingAccounts.forEach((a) => existingIds.add(a.getId()));

      for (const responsible of responsibles) {
        if (!existingIds.has(responsible.accountId)) {
          throw new AccountNotFoundUsecaseException(
            `Tentativa de criar um evento mas foi passado algum id que é inexistente ou não atende os requisitos de role`,
            `Algum usuário passado não atende os requisitos ou é inexistente`,
            CreateEventUseCase.name,
          );
        }
      }
    }

    // Processa a imagem se fornecida
    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.processEventImage(image, name);
    }

    const event = Event.create({
      name,
      startDate,
      endDate,
      regionId: region.getId(),
      imageUrl,
      location,
      longitude,
      latitude,
      status,
      allowedInscriptionModes,
      allowedPaymentModes,
      paymentEnabled,
      ticketEnabled: false,
      participantFieldsConfig,
    });

    await this.prisma.runInTransaction(async (tx) => {
      await this.eventGateway.createTx(event, tx);

      if (responsibles && responsibles.length > 0) {
        const responsibleEntities = responsibles.map((responsible) =>
          EventResponsible.create({
            eventId: event.getId(),
            accountId: responsible.accountId,
          }),
        );
        await this.eventResponsibleGateway.createManyTx(
          responsibleEntities,
          tx,
        );
      }
    });

    const output: CreateEventOutput = {
      id: event.getId(),
    };

    return output;
  }

  private async processEventImage(
    image: string,
    eventName: string,
  ): Promise<string> {
    this.logger.log('Processando imagem do evento');

    const { buffer, extension } =
      await this.imageOptimizerService.processBase64Image(image);

    // Valida a imagem
    const fileName = `event_${sanitizeFileName(eventName)}.${extension}`;
    const isValidImage = await this.imageOptimizerService.validateImage(
      buffer,
      fileName,
    );
    if (!isValidImage) {
      throw new InvalidImageFormatUsecaseException(
        'invalid image format',
        'Formato da imagem inválido',
        CreateEventUseCase.name,
      );
    }

    // Otimiza imagem (ex: converte para webp e reduz tamanho)
    const optimizedImage = await this.imageOptimizerService.optimizeImage(
      buffer,
      IMAGE_OPTIMIZATION_PRESETS.mediumQuality,
    );

    // Sanitiza o nome do evento para evitar caracteres inválidos no Supabase
    const sanitizedEventName = sanitizeFileName(eventName || 'evento');

    // Cria nome do arquivo: event + nome do evento + hora formatada
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDateTime = `${day}-${month}-${year}_${hours}-${minutes}`;
    const finalFileName = `capa_event_${sanitizedEventName}_${formattedDateTime}.${optimizedImage.format}`;

    // Define a pasta como events
    const folderName = `events/${sanitizedEventName}`;

    // Faz upload no Supabase
    const imageUrl = await this.supabaseStorageService.uploadFile({
      folderName: folderName,
      fileName: finalFileName,
      fileBuffer: optimizedImage.buffer,
      contentType: this.imageOptimizerService.getMimeType(
        optimizedImage.format,
      ),
    });

    return imageUrl;
  }
}
