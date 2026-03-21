import { Injectable } from '@nestjs/common';
import archiver from 'archiver';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { canonicalLocality } from 'src/shared/utils/locality';
import { ParticipantsByLocalityXlsxGenerator } from 'src/shared/utils/xlsx/participants/participants-by-locality-xlsx.generator';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { Writable } from 'stream';

export type GenerateXlsxLocalityInput = {
  eventId: string;
  separate: boolean;
};

export type GenerateXlsxLocalityOutput = {
  fileBase64: string;
  filename: string;
  contentType:
    | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    | 'application/zip';
};

@Injectable()
export class GenerateXlsxLocalityUsecase
  implements Usecase<GenerateXlsxLocalityInput, GenerateXlsxLocalityOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountGateway: AccountGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly participantGateway: ParticipantGateway,
  ) {}

  async execute(
    input: GenerateXlsxLocalityInput,
  ): Promise<GenerateXlsxLocalityOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found`,
        `Evento não encontrado`,
        GenerateXlsxLocalityUsecase.name,
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

    const dateSlug = new Date().toISOString().split('T')[0];
    const eventSlug = this.slugify(event.getName());

    // Se não for para separar por localidade ou não houver participantes
    if (!input.separate || rows.length === 0) {
      const xlsxBuffer =
        await ParticipantsByLocalityXlsxGenerator.generateReportXlsx({
          eventName: event.getName(),
          participants: rows,
        });

      const filename = `Lista-de-Participantes-${eventSlug}-${dateSlug}.xlsx`;

      return {
        fileBase64: xlsxBuffer.toString('base64'),
        filename,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    }

    // Separar por localidade
    const byLocality = new Map<string, typeof rows>();
    for (const row of rows) {
      const locality = row.locality || '-';
      const list = byLocality.get(locality) ?? [];
      list.push(row);
      byLocality.set(locality, list);
    }

    const sortedLocalities = [...byLocality.keys()].sort((a, b) => {
      if (a === '-' && b !== '-') return 1;
      if (a !== '-' && b === '-') return -1;
      return a.localeCompare(b, 'pt-BR');
    });

    const nameCounts = new Map<string, number>();
    const xlsxEntries = await Promise.all(
      sortedLocalities.map(async (locality) => {
        const participants = (byLocality.get(locality) ?? []).map((p, idx) => ({
          ...p,
          index: idx + 1,
        }));

        const xlsxBuffer =
          await ParticipantsByLocalityXlsxGenerator.generateReportXlsx({
            eventName: `${event.getName()} - ${locality === '-' ? 'Sem localidade' : locality}`,
            participants,
          });

        const localityLabel = locality === '-' ? 'sem-localidade' : locality;
        const baseName = this.slugify(localityLabel) || 'localidade';
        const count = (nameCounts.get(baseName) ?? 0) + 1;
        nameCounts.set(baseName, count);

        const localitySlug = count === 1 ? baseName : `${baseName}-${count}`;
        const filename = `Lista-de-Participantes-${eventSlug}-${localitySlug}-${dateSlug}.xlsx`;

        return { filename, buffer: xlsxBuffer };
      }),
    );

    const zipBuffer = await this.zipFiles(xlsxEntries);
    const zipFilename = `Lista-de-Participantes-${eventSlug}-por-localidade-${dateSlug}.zip`;

    return {
      fileBase64: zipBuffer.toString('base64'),
      filename: zipFilename,
      contentType: 'application/zip',
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

  private slugify(value: string): string {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
  }

  private zipFiles(
    files: Array<{ filename: string; buffer: Buffer }>,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const chunks: Buffer[] = [];

      const collector = new Writable({
        write(chunk, encoding, callback) {
          chunks.push(
            Buffer.isBuffer(chunk)
              ? chunk
              : Buffer.from(chunk, encoding as BufferEncoding),
          );
          callback();
        },
      });

      collector.on('finish', () => resolve(Buffer.concat(chunks)));
      collector.on('error', reject);

      archive.on('warning', (err: any) => {
        if (err?.code === 'ENOENT') return;
        reject(err);
      });
      archive.on('error', reject);

      archive.pipe(collector);
      for (const file of files) {
        archive.append(file.buffer, { name: file.filename });
      }

      void archive.finalize();
    });
  }
}
