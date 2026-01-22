import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import {
  AccountParticipantsPdfBlock,
  ParticipantsByAccountPdfData,
  ParticipantsByAccountPdfGenerator,
} from 'src/shared/utils/pdfs/participants/participants-by-account-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import {
  countGenderBreakdown,
  GenderFilterInput,
  matchesAllowedGender,
  resolveGenderFilters,
} from './gender-filter.helper';
import { buildTypeCounts } from './type-count.helper';

export type GeneratePdfParticipantsAllInput = {
  eventId: string;
  genders?: GenderFilterInput;
};

export type GeneratePdfParticipantsAllOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfParticipantsAllUsecase
  implements
    Usecase<GeneratePdfParticipantsAllInput, GeneratePdfParticipantsAllOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly userGateway: AccountGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: GeneratePdfParticipantsAllInput,
  ): Promise<GeneratePdfParticipantsAllOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with eventId: ${input.eventId}`,
        `Evento não encontrado ou inválido`,
        GeneratePdfParticipantsAllUsecase.name,
      );
    }

    const imagePath = await this.getImageBase64(event.getLogoUrl());

    const accounts = await this.userGateway.findAll();
    const accountIds = accounts.map((a) => a.getId());
    const userMap = new Map(accounts.map((a) => [a.getId(), a.getUsername()]));

    const allParticipants =
      await this.accountParticipantInEventGateway.findByEventIdAndAccountIds(
        input.eventId,
        accountIds,
      );

    const allowedGenders = resolveGenderFilters(input.genders);
    const filteredParticipants = allParticipants.filter((p) =>
      matchesAllowedGender(p.participantGender, allowedGenders),
    );

    const accountsData = accounts
      .map((account) => {
        const participants = filteredParticipants
          .filter((p) => p.accountId === account.getId())
          .map((p) => ({
            id: p.participantId,
            name: p.participantName,
            birthDate: p.participantBirthDate,
            typeInscription: p.typeInscriptionDescription ?? 'Não informado',
            gender: p.participantGender,
          }));

        const { totalMale, totalFemale } = countGenderBreakdown(participants);

        const typeCounts = buildTypeCounts(participants);

        return {
          accountId: account.getId(),
          username: userMap.get(account.getId()) ?? 'Usuário não identificado',
          totalParticipants: participants.length,
          totalMale,
          totalFemale,
          typeCounts,
          participants,
        };
      })
      .filter((a) => a.totalParticipants > 0);

    const accountsPdfData: AccountParticipantsPdfBlock[] = accountsData.map(
      (account) => ({
        accountId: account.accountId,
        username: account.username,
        totalParticipants: account.totalParticipants,
        totalMale: account.totalMale,
        totalFemale: account.totalFemale,
        typeCounts: account.typeCounts,
        participants: account.participants,
      }),
    );

    const participantsPdfData: ParticipantsByAccountPdfData = {
      header: {
        title: event.getName(),
        titleDetail: this.formatEventPeriod(
          event.getStartDate(),
          event.getEndDate(),
        ),
        subtitle: `Lista de participantes`,
        image: imagePath || undefined,
      },
      items: accountsPdfData,
    };

    const pdfBuffer =
      await ParticipantsByAccountPdfGenerator.generateParticipantsByAccountPdf(
        participantsPdfData,
      );

    return {
      pdfBase64: pdfBuffer.toString('base64'),
      filename: this.buildFilename(event.getName(), event.getId()),
    };
  }

  private async getImageBase64(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      // get image
      const publicUrl = await this.supabaseStorageService.getPublicUrl(path);

      if (!publicUrl) {
        throw new Error('Image not found');
      }

      // Download image in ArrayBuffer
      const response = await axios.get<ArrayBuffer>(publicUrl, {
        responseType: 'arraybuffer',
      });

      // Detect image type (png, jpg, jpeg)
      const contentType = response.headers['content-type'] || 'image/jpeg';

      // Convert to base64
      const base64 = Buffer.from(response.data).toString('base64');

      // Return in correct format for PDFMake
      return `data:${contentType};base64,${base64}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return '';
    }
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

  private buildFilename(
    eventName: string | undefined | null,
    eventId: string,
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

    return `lista-participantes-${sanitizedEventName}-${eventId}.pdf`;
  }
}
