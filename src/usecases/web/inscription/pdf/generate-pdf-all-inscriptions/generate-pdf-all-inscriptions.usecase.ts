import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  genderType,
  InscriptionStatus,
  ShirtSize,
  ShirtType,
} from 'generated/prisma';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import {
  ListInscriptionsPdfData,
  ListInscriptionsPdfGeneratorUtils,
} from 'src/shared/utils/pdfs/inscriptions/list-Inscriptions-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type GeneratePdfAllInscriptionsInput = {
  eventId: string;
  isGuest?: boolean;
  details: boolean;
  participants: boolean;
};

type InscriptionsDetails = {
  id: string;
  responsible: string;
  locality: string;
  status: InscriptionStatus;
  createdAt: Date;
  isGuest?: boolean;
  participants?: ParticipantDetails[];
};

type ParticipantDetails = {
  name: string;
  birthDate: Date;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender: genderType;
};

export type GeneratePdfAllInscriptionsOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfAllInscriptionsUsecase
  implements
    Usecase<GeneratePdfAllInscriptionsInput, GeneratePdfAllInscriptionsOutput>
{
  constructor(
    private readonly accountGateway: AccountGateway,
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: GeneratePdfAllInscriptionsInput,
  ): Promise<GeneratePdfAllInscriptionsOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with finding event with id ${input.eventId}`,
        `Evento não encontrado`,
        GeneratePdfAllInscriptionsUsecase.name,
      );
    }

    const [inscriptions, totalInscription, totalAccountParticipants] =
      await Promise.all([
        this.inscriptionGateway.findMany(event.getId(), input.isGuest),
        this.inscriptionGateway.countAllByEvent(event.getId(), input.isGuest),
        this.accountParticipantInEventGateway.countParticipantsByEventId(
          event.getId(),
        ),
      ]);

    let totalGuestParticipants = 0;
    if (input.isGuest !== false) {
      totalGuestParticipants = await this.participantGateway.countAllByEventId(
        event.getId(),
      );
    }

    const inscriptionDetails: InscriptionsDetails[] = await Promise.all(
      inscriptions.map(async (i) => {
        let participants: ParticipantDetails[] = [];

        if (input.participants) {
          participants = (
            await this.accountParticipantGateway.findByInscriptionId(i.getId())
          ).map((p) => ({
            name: p.getName(),
            birthDate: p.getBirthDate(),
            shirtSize: p.getShirtSize(),
            shirtType: p.getShirtType(),
            gender: p.getGender(),
          }));

          if (i.getIsGuest() && input.isGuest !== false) {
            participants = (
              await this.participantGateway.findByInscriptionId(i.getId())
            ).map((p) => ({
              name: p.getName(),
              birthDate: p.getBirthDate(),
              shirtSize: p.getShirtSize(),
              shirtType: p.getShirtType(),
              gender: p.getGender(),
            }));
          }
        }

        let locality = '';
        if (i.getIsGuest()) {
          locality = i.getGuestLocality() ?? '';
        }

        if (!i.getIsGuest()) {
          const account = await this.accountGateway.findById(i.getAccountId()!);
          locality = account?.getUsername() ?? '';
        }

        return {
          id: i.getId(),
          responsible: i.getResponsible(),
          locality,
          status: i.getStatus(),
          createdAt: i.getCreatedAt(),
          isGuest: i.getIsGuest(),
          participants,
        };
      }),
    );

    const eventImageBase64 = await this.getImageBase64(event.getImageUrl());

    const pdfData: ListInscriptionsPdfData = {
      header: {
        title: event.getName() ?? 'Evento',
        titleDetail: this.formatEventPeriod(
          event.getStartDate(),
          event.getEndDate(),
        ),
        subtitle: 'Lista de Inscrições',
        image: eventImageBase64 || undefined,
      },
      inscriptions: inscriptionDetails,
      totals: {
        totalInscriptions: input.details ? totalInscription : undefined,
        totalAccountParticipants,
        totalGuestParticipants,
      },
    };

    const pdfBuffer =
      await ListInscriptionsPdfGeneratorUtils.generateListInscriptionsPdf(
        pdfData,
      );

    return {
      pdfBase64: pdfBuffer.toString('base64'),
      filename: this.buildFilename(
        event.getName(),
        event.getId(),
        input.isGuest ?? false,
      ),
    };
  }

  private buildFilename(
    eventName: string | undefined | null,
    eventId: string,
    isGuest: boolean,
  ): string {
    const sanitizedEventName = eventName
      ? eventName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase()
      : 'evento';

    const suffix = isGuest ? 'convidados' : 'inscricoes';
    return `lista-${suffix}-${sanitizedEventName}-${eventId}.pdf`;
  }

  private formatEventPeriod(
    startDate?: Date | null,
    endDate?: Date | null,
  ): string | undefined {
    const formattedStart = startDate
      ? new Date(startDate).toLocaleDateString('pt-BR')
      : undefined;
    const formattedEnd = endDate
      ? new Date(endDate).toLocaleDateString('pt-BR')
      : undefined;

    if (formattedStart && formattedEnd) {
      return `${formattedStart} até ${formattedEnd}`;
    }

    return formattedStart ?? formattedEnd ?? undefined;
  }

  private async getPublicUrl(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }

  private async getImageBase64(path?: string): Promise<string> {
    const publicUrl = await this.getPublicUrl(path);
    if (!publicUrl) {
      return '';
    }

    try {
      const response = await axios.get<ArrayBuffer>(publicUrl, {
        responseType: 'arraybuffer',
      });

      const base64Image = Buffer.from(response.data).toString('base64');
      return `data:image/jpeg;base64,${base64Image}`;
    } catch {
      return '';
    }
  }
}
