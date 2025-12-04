import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import {
  AccountParticipantsPdfBlock,
  ParticipantsByAccountPdfData,
  ParticipantsByAccountPdfGenerator,
} from 'src/shared/utils/pdfs/participants/participants-by-account-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type GeneratePdfParticipantsAllInput = {
  eventId: string;
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
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly userGateway: AccountGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: GeneratePdfParticipantsAllInput,
  ): Promise<GeneratePdfParticipantsAllOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found when searching with eventId: ${input.eventId} in ${GeneratePdfParticipantsAllUsecase.name}`,
        `Evento não encontrado ou invalido`,
        GeneratePdfParticipantsAllUsecase.name,
      );
    }
    const imagePath = await this.getImageBase64(event.getLogoUrl());

    const accounts = await this.userGateway.findAll();

    const accountData = await Promise.all(
      accounts.map(async (account) => {
        // Buscar informações da conta
        const accoundInfo = await this.userGateway.findById(account.getId());

        // Search all accounts
        const accountInscriptions =
          await this.inscriptionGateway.findByEventIdAndAccountId(
            event.getId(),
            account.getId(),
          );

        // Para cada inscrição, buscar participantes
        const allParticipants: Array<{
          id: string;
          name: string;
          birthDate: Date;
          gender: string;
        }> = [];

        for (const inscription of accountInscriptions) {
          const participants =
            await this.participantGateway.findByInscriptionId(
              inscription.getId(),
            );

          // Converter participantes para o formato do PDF
          const formattedParticipants = participants.map((p) => ({
            id: p.getId(),
            name: p.getName(),
            birthDate: p.getBirthDate(),
            gender: p.getGender(),
          }));

          allParticipants.push(...formattedParticipants);
        }

        return {
          accountId: account.getId(),
          username: accoundInfo?.getUsername() ?? 'Usuário não identificado',
          totalParticipants: allParticipants.length,
          participants: allParticipants,
        };
      }),
    );

    // Filtrar contas que não têm inscrições no evento
    const validAccountsData = accountData.filter(
      (account) => account.totalParticipants > 0,
    );

    // Converter para o formato do PDF
    const accountsPdfData: AccountParticipantsPdfBlock[] =
      validAccountsData.map((account) => ({
        accountId: account.accountId,
        username: account.username,
        totalParticipants: account.totalParticipants,
        participants: account.participants.map((p) => ({
          id: p.id,
          name: p.name,
          birthDate: p.birthDate,
          gender: p.gender,
        })),
      }));

    const participantsPdfData: ParticipantsByAccountPdfData = {
      header: {
        title: event?.getName() ?? 'Evento',
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

    const filename = this.buildFilename(event.getName(), event.getId());

    return {
      pdfBase64: pdfBuffer.toString('base64'),
      filename,
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
