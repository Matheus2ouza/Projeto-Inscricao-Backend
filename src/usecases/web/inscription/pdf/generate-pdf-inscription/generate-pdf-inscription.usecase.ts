import { Injectable } from '@nestjs/common';
import axios from 'axios'; // ✅ IMPORTANTE
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import {
  InscriptionPdfData,
  InscriptionPdfGeneratorUtils,
} from 'src/shared/utils/pdfs/inscriptions/inscription-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { InscriptionNotFoundUsecaseException } from 'src/usecases/web/exceptions/inscription/find/inscription-not-found.usecase.exception';

export type GeneratePdfInscriptionInput = {
  inscriptionId: string;
};

export type GeneratePdfInscriptionOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfInscriptionUsecase
  implements Usecase<GeneratePdfInscriptionInput, GeneratePdfInscriptionOutput>
{
  public constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: GeneratePdfInscriptionInput,
  ): Promise<GeneratePdfInscriptionOutput> {
    const inscription = await this.inscriptionGateway.findById(
      input.inscriptionId,
    );

    if (!inscription) {
      throw new InscriptionNotFoundUsecaseException(
        `Attempt to generate registration list with registrationId:${input.inscriptionId} but no registrations were found.`,
        `Nenhuma inscrição encontrada`,
        GeneratePdfInscriptionUsecase.name,
      );
    }

    const eventDetails = await this.eventGateway.findBasicDataForPdf(
      inscription.getEventId(),
    );

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

    const participants = await this.participantGateway.findByInscriptionId(
      inscription.getId(),
    );

    const mappedParticipants = participants.map((participant) => ({
      name: participant.getName(),
      birthDate: participant.getBirthDate(),
      gender: participant.getGender(),
    }));

    const inscriptionPdfData: InscriptionPdfData = {
      header: {
        title: eventDetails?.getName() ?? 'Evento',
        titleDetail: this.formatEventPeriod(
          eventDetails?.getStartDate(),
          eventDetails?.getEndDate(),
        ),
        subtitle: 'Lista de Inscrição',
        image: eventImageBase64 || undefined,
      },
      id: inscription.getId(),
      responsible: inscription.getResponsible(),
      createAt: inscription.getCreatedAt(),
      event: {
        name: eventDetails?.getName(),
        startDate: eventDetails?.getStartDate(),
        endDate: eventDetails?.getEndDate(),
      },
      participants: mappedParticipants,
    };

    const pdfBuffer =
      await InscriptionPdfGeneratorUtils.generateInscriptionListPdf(
        inscriptionPdfData,
      );

    const filename = this.buildFilename(
      inscriptionPdfData.event.name,
      inscriptionPdfData.id,
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
