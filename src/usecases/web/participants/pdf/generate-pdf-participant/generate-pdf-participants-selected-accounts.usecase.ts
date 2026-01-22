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
import { EventNotFoundUsecaseException } from '../../../exceptions/events/event-not-found.usecase.exception';
import { MissingParticipantIdsUsecaseException } from '../../../exceptions/participants/missing-participant-ids.usecase.exception';
import {
  countGenderBreakdown,
  GenderFilterInput,
  matchesAllowedGender,
  resolveGenderFilters,
} from './gender-filter.helper';
import { buildTypeCounts } from './type-count.helper';

export type GeneratePdfParticipantsSelectedAccountsInput = {
  eventId: string;
  accountsId: string[];
  genders?: GenderFilterInput;
};

export type GeneratePdfParticipantsSelectedAccountsOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfParticipantsSelectedAccountsUsecase
  implements
    Usecase<
      GeneratePdfParticipantsSelectedAccountsInput,
      GeneratePdfParticipantsSelectedAccountsOutput
    >
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly userGateway: AccountGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: GeneratePdfParticipantsSelectedAccountsInput,
  ): Promise<GeneratePdfParticipantsSelectedAccountsOutput> {
    if (!input.accountsId || input.accountsId.length === 0) {
      throw new MissingParticipantIdsUsecaseException(
        `Missing accountsId when executing ${GeneratePdfParticipantsSelectedAccountsUsecase.name}`,
        `Selecione ao menos uma conta para gerar o PDF`,
        GeneratePdfParticipantsSelectedAccountsUsecase.name,
      );
    }

    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with eventId: ${input.eventId}`,
        `Evento não encontrado ou inválido`,
        GeneratePdfParticipantsSelectedAccountsUsecase.name,
      );
    }

    const imagePath = await this.getImageBase64(event.getLogoUrl());

    const allParticipants =
      await this.accountParticipantInEventGateway.findByEventIdAndAccountIds(
        input.eventId,
        input.accountsId,
      );

    const allowedGenders = resolveGenderFilters(input.genders);
    const filteredParticipants = allParticipants.filter((p) =>
      matchesAllowedGender(p.participantGender, allowedGenders),
    );

    const users = await this.userGateway.findByIds(input.accountsId);

    const userMap = new Map(users.map((u) => [u.getId(), u.getUsername()]));

    const validAccountsData = input.accountsId
      .map((accountId) => {
        const username = userMap.get(accountId) ?? 'Usuário não identificado';

        const participants = filteredParticipants
          .filter((p) => p.accountId === accountId)
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
          accountId,
          username,
          totalParticipants: participants.length,
          totalMale,
          totalFemale,
          typeCounts,
          participants,
        };
      })
      .filter((acc) => acc.totalParticipants > 0);

    const accountsPdfData: AccountParticipantsPdfBlock[] =
      validAccountsData.map((account) => ({
        accountId: account.accountId,
        username: account.username,
        totalParticipants: account.totalParticipants,
        totalMale: account.totalMale,
        totalFemale: account.totalFemale,
        typeCounts: account.typeCounts,
        participants: account.participants,
      }));

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
}
