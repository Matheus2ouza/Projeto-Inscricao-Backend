import { Injectable } from '@nestjs/common';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { canonicalLocality } from 'src/shared/utils/locality';
import { LocalityPdfGeneratorUtils } from 'src/shared/utils/pdfs/participants/locality-pdf-generator.util';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type GeneratePdfLocalityInput = {
  eventId: string;
};

export type GeneratePdfLocalityOutput = {
  pdfBase64: string;
  filename: string;
};

@Injectable()
export class GeneratePdfLocalityUseCase
  implements Usecase<GeneratePdfLocalityInput, GeneratePdfLocalityOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountGateway: AccountGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly participantGateway: ParticipantGateway,
  ) {}

  async execute(
    input: GeneratePdfLocalityInput,
  ): Promise<GeneratePdfLocalityOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found`,
        `Evento não encontrado`,
        GeneratePdfLocalityUseCase.name,
      );
    }

    const inscriptions = await this.inscriptionGateway.findByLocality(
      input.eventId,
    );

    const inscriptionIds = inscriptions.map((inscription) =>
      inscription.getId(),
    );

    // Buscar participantes normais (accountParticipant)
    const participantsNormalArray =
      await this.accountParticipantGateway.findByInscriptionsIds(
        inscriptionIds,
      );

    const rowsNormal = await Promise.all(
      participantsNormalArray.map(async (pn) => {
        const account = await this.accountGateway.findById(pn.getAccountId());
        return {
          name: pn.getName(),
          preferredName: pn.getPreferredName(),
          locality: account?.getUsername() ?? '-',
          age: this.calculateAge(pn.getBirthDate()),
          shirtSize: pn.getShirtSize(),
          shirtType: pn.getShirtType(),
          gender: pn.getGender(),
        };
      }),
    );

    // Buscar participantes guest
    const participantsGuest =
      await this.participantGateway.findByInscriptionsIds(inscriptionIds);

    const localityByInscriptionId = new Map(
      inscriptions.map((inscription) => {
        const canonical = canonicalLocality(inscription.getGuestLocality());
        return [inscription.getId(), canonical || '-'] as const;
      }),
    );

    const rowsGuest = participantsGuest.map((participant) => {
      const locality =
        localityByInscriptionId.get(participant.getInscriptionId()) ?? '-';
      return {
        name: participant.getName(),
        preferredName: participant.getPreferredName(),
        locality,
        age: this.calculateAge(participant.getBirthDate()),
        shirtSize: participant.getShirtSize(),
        shirtType: participant.getShirtType(),
        gender: participant.getGender(),
      };
    });

    // Unir, ordenar por localidade e nome, e indexar
    const rows = [...rowsNormal, ...rowsGuest]
      .sort((a, b) => {
        const localityCompare = a.locality.localeCompare(b.locality, 'pt-BR');
        if (localityCompare !== 0) return localityCompare;
        return a.name.localeCompare(b.name, 'pt-BR');
      })
      .map((p, index) => ({
        index: index + 1,
        ...p,
      }));

    const pdfBuffer = await LocalityPdfGeneratorUtils.generateReportPdf({
      eventName: event.getName(),
      participants: rows,
    });

    const filename = `Lista-de-Participantes-${event
      .getName()
      .replace(/\s+/g, '-')
      .toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;

    return {
      pdfBase64: pdfBuffer.toString('base64'),
      filename,
    };
  }

  private calculateAge(birthDate: Date): number {
    const b = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - b.getFullYear();
    const monthDiff = now.getMonth() - b.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < b.getDate())) {
      age -= 1;
    }

    return Math.max(0, age);
  }
}
