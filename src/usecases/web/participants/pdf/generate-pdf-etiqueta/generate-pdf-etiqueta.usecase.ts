import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import {
  EtiquetaPdfGenerator,
  ParticipantEtiquetaEntry,
} from 'src/shared/utils/pdfs/participants/etiqueta-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type GeneratePdfEtiquetaInput = {
  eventId: string;
  accountsId: string[];
};

export type GeneratePdfEtiquetaOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfEtiquetaUseCase
  implements Usecase<GeneratePdfEtiquetaInput, GeneratePdfEtiquetaOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly incriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
  ) {}

  public async execute(
    input: GeneratePdfEtiquetaInput,
  ): Promise<GeneratePdfEtiquetaOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with eventId: ${input.eventId}`,
        `Evento não encontrado ou inválido`,
        GeneratePdfEtiquetaUseCase.name,
      );
    }

    const allInscriptions =
      await this.incriptionGateway.findManyByEventAndAccountIds(
        event.getId(),
        input.accountsId,
      );

    const inscriptionIds = allInscriptions.map((i) => i.getId());

    const allParticipants = inscriptionIds.length
      ? await this.participantGateway.findManyByInscriptionIds(inscriptionIds)
      : [];

    const labelEntries: ParticipantEtiquetaEntry[] = allParticipants.map(
      (participant) => {
        return {
          participantName: participant.getName(),
        };
      },
    );

    const pdfBuffer =
      await EtiquetaPdfGenerator.generateLabelSheetPdf(labelEntries);

    return {
      pdfBase64: pdfBuffer.toString('base64'),
      filename: this.buildFilename(event.getName(), event.getId()),
    };
  }

  private buildFilename(eventName: string | undefined | null, eventId: string) {
    const sanitizedEventName = eventName
      ? eventName
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase()
      : 'evento';

    return `etiquetas-${sanitizedEventName}-${eventId}.pdf`;
  }
}
