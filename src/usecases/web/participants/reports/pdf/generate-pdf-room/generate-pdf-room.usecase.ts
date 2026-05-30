import { Injectable } from '@nestjs/common';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { ParticipantsRoomPdfGenerator } from 'src/shared/utils/pdfs/participants/participants-room-pdf.generator';
import { Usecase } from 'src/usecases/usecase';

export type GeneratePdfRoomInput = {
  title: string;
  observation?: string;
  listParticipants: (ParticipantsRoom | CustomParticipant)[];
};

export type ParticipantsRoom = {
  id: string;
  isCustom?: false;
};

export type CustomParticipant = {
  id: string;
  name: string;
  isCustom: true;
  locality?: string;
};

export type GeneratePdfRoomOutput = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf';
};

@Injectable()
export class GeneratePdfRoomUsecase
  implements Usecase<GeneratePdfRoomInput, GeneratePdfRoomOutput>
{
  constructor(
    private readonly participantGateway: ParticipantGateway,
    private readonly inscriptionGateway: InscriptionGateway,
  ) {}

  async execute(input: GeneratePdfRoomInput): Promise<GeneratePdfRoomOutput> {
    // Separar participantes reais (que estão no banco) dos personalizados
    const realParticipantItems = input.listParticipants.filter(
      (item): item is ParticipantsRoom =>
        !('isCustom' in item) || !item.isCustom,
    );

    const customParticipants = input.listParticipants.filter(
      (item): item is CustomParticipant =>
        'isCustom' in item && item.isCustom === true,
    );

    // Buscar participantes reais do banco
    let realParticipantsList: Array<{
      index: number;
      name: string;
      locality: string;
    }> = [];

    if (realParticipantItems.length > 0) {
      const ids = realParticipantItems.map((participant) => participant.id);
      const participants = await this.participantGateway.findByIds(ids);

      // Criar um mapa de participantes por ID para acesso rápido
      const participantMap = new Map(
        participants.map((participant) => [participant.getId(), participant]),
      );

      // Buscar as inscrições
      const inscriptionsIds = participants.map((participant) =>
        participant.getInscriptionId(),
      );
      const inscriptions =
        await this.inscriptionGateway.findManyByIds(inscriptionsIds);

      // Criar um mapa de inscrição por ID para acesso rápido
      const inscriptionMap = new Map(
        inscriptions.map((inscription) => [inscription.getId(), inscription]),
      );

      // Montar lista de participantes reais na ordem do frontend
      realParticipantsList = realParticipantItems.map((item, index) => {
        const participant = participantMap.get(item.id);

        if (!participant) {
          return {
            index: 0, // Será reindexado depois
            name: 'Participante não encontrado',
            locality: 'Localidade não informada',
          };
        }

        const inscription = inscriptionMap.get(participant.getInscriptionId());
        const fullLocality = inscription?.getGuestLocality() || '';
        const locality = this.extractLocality(fullLocality);

        return {
          index: 0, // Será reindexado depois
          name: participant.getName() || 'Nome não informado',
          locality: locality || 'Localidade não informada',
        };
      });
    }

    // Montar lista de participantes personalizados
    const customParticipantsList = customParticipants.map((item) => ({
      index: 0, // Será reindexado depois
      name: item.name,
      locality: item.locality || 'Acompanhante',
    }));

    // Unir as listas mantendo a ordem original
    let allParticipants: Array<{
      index: number;
      name: string;
      locality: string;
    }> = [];
    let realIndex = 0;
    let customIndex = 0;

    for (const item of input.listParticipants) {
      if ('isCustom' in item && item.isCustom === true) {
        // É um participante personalizado
        if (customParticipantsList[customIndex]) {
          allParticipants.push(customParticipantsList[customIndex]);
          customIndex++;
        }
      } else {
        // É um participante real
        if (realParticipantsList[realIndex]) {
          allParticipants.push(realParticipantsList[realIndex]);
          realIndex++;
        }
      }
    }

    // Reindexar após a ordenação
    const finalParticipantsList = allParticipants.map((participant, index) => ({
      ...participant,
      index: index + 1,
    }));

    const pdfBuffer = await ParticipantsRoomPdfGenerator.generateReportPdf({
      title: input.title.toUpperCase(),
      participants: finalParticipantsList,
      observation: input.observation,
    });

    // Criar nome do arquivo
    const dateSlug = new Date().toISOString().split('T')[0];
    const titleSlug = this.slugify(input.title);
    const filename = `Lista-de-Participantes-Quarto-${titleSlug}-${dateSlug}.pdf`;

    return {
      fileBase64: pdfBuffer.toString('base64'),
      filename,
      contentType: 'application/pdf',
    };
  }

  private extractLocality(fullLocality: string): string {
    if (!fullLocality) return '';
    const parts = fullLocality.split('-');
    return parts[0]?.trim() || '';
  }

  private slugify(value: string): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }
}
