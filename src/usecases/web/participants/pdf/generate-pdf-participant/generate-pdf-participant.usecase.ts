import { Injectable } from '@nestjs/common';
import axios from 'axios';
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
import { EventNotFoundUsecaseException } from '../../../exceptions/events/event-not-found.usecase.exception';
import { MissingParticipantIdsUsecaseException } from '../../../exceptions/participants/missing-participant-ids.usecase.exception';

export type GeneratePdfSelectedParticipantInput = {
  eventId: string;
  accountsId: string[];
};

export type GeneratePdfSelectedParticipantOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfSelectedParticipantUsecase
  implements
    Usecase<
      GeneratePdfSelectedParticipantInput,
      GeneratePdfSelectedParticipantOutput
    >
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly userGateway: AccountGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: GeneratePdfSelectedParticipantInput,
  ): Promise<GeneratePdfSelectedParticipantOutput> {
    if (!input.accountsId || input.accountsId.length < 1) {
      throw new MissingParticipantIdsUsecaseException(
        `Missing accountsId when executing ${GeneratePdfSelectedParticipantUsecase.name}`,
        `Selecione ao menos uma conta para gerar o PDF`,
        GeneratePdfSelectedParticipantUsecase.name,
      );
    }

    const eventDetails = await this.eventGateway.findById(input.eventId);

    if (!eventDetails) {
      throw new EventNotFoundUsecaseException(
        `Event not found when searching with eventId: ${input.eventId} in ${GeneratePdfSelectedParticipantUsecase.name}`,
        `Evento não encontrado ou invalido`,
        GeneratePdfSelectedParticipantUsecase.name,
      );
    }

    let publicImageUrl = '';
    const imagePath = eventDetails?.getImageUrl();
    if (imagePath) {
      try {
        publicImageUrl =
          await this.supabaseStorageService.getPublicUrl(imagePath);
      } catch {
        publicImageUrl = '';
      }
    }

    let eventImageBase64 = '';
    if (publicImageUrl) {
      try {
        const response = await axios.get<ArrayBuffer>(publicImageUrl, {
          responseType: 'arraybuffer',
        });
        const base64Image = Buffer.from(response.data).toString('base64');
        eventImageBase64 = `data:image/jpeg;base64,${base64Image}`;
      } catch {
        eventImageBase64 = '';
      }
    }

    // Buscar dados das contas selecionadas
    const accountsData = await Promise.all(
      input.accountsId.map(async (accountId) => {
        // Buscar informações da conta
        const user = await this.userGateway.findById(accountId);

        // Buscar todas as inscrições dessa conta no evento
        const accountInscriptions =
          await this.inscriptionGateway.findByEventIdAndAccountId(
            input.eventId,
            accountId,
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
          accountId,
          username: user?.getUsername() ?? 'Usuário não identificado',
          totalParticipants: allParticipants.length,
          participants: allParticipants,
        };
      }),
    );

    // Filtrar contas que não têm inscrições no evento
    const validAccountsData = accountsData.filter(
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
        title: eventDetails?.getName() ?? 'Evento',
        titleDetail: this.formatEventPeriod(
          eventDetails.getStartDate(),
          eventDetails.getEndDate(),
        ),
        subtitle: `Lista de participantes por conta`,
        image: eventImageBase64 || undefined,
      },
      items: accountsPdfData,
    };

    const pdfBuffer =
      await ParticipantsByAccountPdfGenerator.generateParticipantsByAccountPdf(
        participantsPdfData,
      );

    const filename = this.buildFilename(
      eventDetails.getName(),
      eventDetails.getId(),
    );

    return {
      pdfBase64: pdfBuffer.toString('base64'),
      filename,
    };
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
