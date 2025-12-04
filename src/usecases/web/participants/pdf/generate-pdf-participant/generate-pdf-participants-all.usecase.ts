import { Injectable } from '@nestjs/common';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
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
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
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

    const allInscriptions =
      await this.inscriptionGateway.findManyByEventAndAccountIds(
        input.eventId,
        accountIds,
      );

    const inscriptionIds = allInscriptions.map((i) => i.getId());

    const allParticipants = inscriptionIds.length
      ? await this.participantGateway.findManyByInscriptionIds(inscriptionIds)
      : [];

    const typeIds = [
      ...new Set(allParticipants.map((p) => p.getTypeInscriptionId())),
    ];

    const allTypes = typeIds.length
      ? await this.typeInscriptionGateway.findByIds(typeIds)
      : [];

    const typeMap = new Map(
      allTypes.map((t) => [t.getId(), t.getDescription()]),
    );

    const participantMap = new Map<string, any[]>();

    for (const p of allParticipants) {
      const entry = participantMap.get(p.getInscriptionId()) || [];
      entry.push({
        id: p.getId(),
        name: p.getName(),
        birthDate: p.getBirthDate(),
        typeInscription:
          typeMap.get(p.getTypeInscriptionId()) ?? 'Não informado',
        gender: p.getGender(),
      });
      participantMap.set(p.getInscriptionId(), entry);
    }

    const accountsData = accounts
      .map((account) => {
        const inscriptions = allInscriptions.filter(
          (ins) => ins.getAccountId() === account.getId(),
        );

        const participants = inscriptions.flatMap(
          (ins) => participantMap.get(ins.getId()) || [],
        );

        return {
          accountId: account.getId(),
          username: userMap.get(account.getId()) ?? 'Usuário não identificado',
          totalParticipants: participants.length,
          participants,
        };
      })
      .filter((a) => a.totalParticipants > 0);

    const accountsPdfData: AccountParticipantsPdfBlock[] = accountsData.map(
      (account) => ({
        accountId: account.accountId,
        username: account.username,
        totalParticipants: account.totalParticipants,
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
