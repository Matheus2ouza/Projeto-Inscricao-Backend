import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { UserGateway } from 'src/domain/repositories/user.geteway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import {
  SelectedInscriptionPdfData,
  SelectedInscriptionPdfGeneratorUtils,
} from 'src/shared/utils/pdfs/selected-inscription/selected-inscription-pdf-generator.util';
import { EventNotFoundUsecaseException } from 'src/usecases/exceptions/events/event-not-found.usecase.exception';
import { MissingInscriptionIdsUsecaseException } from 'src/usecases/exceptions/inscription/missing-inscription-ids.usecase.exception';
import { Usecase } from 'src/usecases/usecase';

export type GeneratePdfSelectedInscriptionInput = {
  eventId: string;
  inscriptionIds: string[];
};

export type GeneratePdfSelectedInscriptionOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfSelectedInscriptionUsecase
  implements
    Usecase<
      GeneratePdfSelectedInscriptionInput,
      GeneratePdfSelectedInscriptionOutput
    >
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly userGateway: UserGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: GeneratePdfSelectedInscriptionInput,
  ): Promise<GeneratePdfSelectedInscriptionOutput> {
    if (!input.inscriptionIds || input.inscriptionIds.length < 1) {
      throw new MissingInscriptionIdsUsecaseException(
        `Missing inscriptionsId when executing ${GeneratePdfSelectedInscriptionUsecase.name}`,
        `Selecione ao menos uma inscrição para gerar o PDF`,
        GeneratePdfSelectedInscriptionUsecase.name,
      );
    }

    const eventDetails = await this.eventGateway.findById(input.eventId);

    if (!eventDetails) {
      throw new EventNotFoundUsecaseException(
        `Event not found when searching with eventId: ${input.eventId} in ${GeneratePdfSelectedInscriptionUsecase.name}`,
        `Evento não encontrado ou invalido`,
        GeneratePdfSelectedInscriptionUsecase.name,
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

    const inscriptionsWithParticipants = await Promise.all(
      input.inscriptionIds.map(async (inscriptionId) => {
        const inscription =
          await this.inscriptionGateway.findById(inscriptionId);

        if (!inscription || inscription.getEventId() !== input.eventId) {
          return null;
        }

        const participants = await this.participantGateway.findByInscriptionId(
          inscription.getId(),
        );

        return {
          inscription,
          participants,
        };
      }),
    );

    const filteredInscriptions = inscriptionsWithParticipants.filter(
      (inscription): inscription is NonNullable<typeof inscription> =>
        Boolean(inscription),
    );

    const inscriptionsByAccount = new Map<
      string,
      NonNullable<(typeof inscriptionsWithParticipants)[number]>[]
    >();

    filteredInscriptions.forEach((entry) => {
      const accountId = entry.inscription.getAccountId();
      const accountInscriptions = inscriptionsByAccount.get(accountId) ?? [];
      accountInscriptions.push(entry);
      inscriptionsByAccount.set(accountId, accountInscriptions);
    });

    const accountsPdfData = await Promise.all(
      Array.from(inscriptionsByAccount.entries()).map(
        async ([accountId, inscriptions]) => {
          const user = await this.userGateway.findById(accountId);

          return {
            id: accountId,
            username: user?.getUsername() ?? 'Usuário não identificado',
            inscriptions: inscriptions.map(
              ({ inscription, participants: participantsEntities }) => ({
                id: inscription.getId(),
                responsible: inscription.getResponsible(),
                createdAt: inscription.getCreatedAt(),
                participants: participantsEntities.map((participant) => ({
                  name: participant.getName(),
                  birthDate: participant
                    .getBirthDate()
                    .toISOString()
                    .split('T')[0],
                  gender: participant.getGender(),
                })),
              }),
            ),
          };
        },
      ),
    );

    const selectedInscriptionPdfData: SelectedInscriptionPdfData = {
      header: {
        title: eventDetails?.getName() ?? 'Evento',
        titleDetail: this.formatEventPeriod(
          eventDetails.getStartDate(),
          eventDetails.getEndDate(),
        ),
        subtitle: `Lista de inscrições selecionadas`,
        image: eventImageBase64 || undefined,
      },
      accounts: accountsPdfData,
    };

    const pdfBuffer =
      await SelectedInscriptionPdfGeneratorUtils.generateSelectedInscriptionListPdf(
        selectedInscriptionPdfData,
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
    inscriptionId: string,
  ): string {
    const sanitizedEventName = eventName
      ? eventName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase()
      : 'inscricao';

    return `lista-inscricao-${sanitizedEventName}-${inscriptionId}.pdf`;
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
