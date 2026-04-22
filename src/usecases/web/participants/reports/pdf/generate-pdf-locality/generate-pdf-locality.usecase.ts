import { Injectable } from '@nestjs/common';
import axios from 'axios';
import archiver from 'archiver';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { canonicalLocality } from 'src/shared/utils/locality';
import { ParticipantsByLocalityPdfGenerator } from 'src/shared/utils/pdfs/participants/participants-by-locality-pdf.generator';
import { ParticipantsByLocalitySummarizedPdfGenerator } from 'src/shared/utils/pdfs/participants/participants-by-locality-summarized-pdf.generator';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { Writable } from 'stream';

export type GeneratePdfLocalityInput = {
  eventId: string;
  separate: boolean;
  reduced: boolean;
  summary: boolean;
  // Query params can arrive as `string` (e.g. "name,preferredName") or `string[]`
  // depending on how the client builds the URL.
  columns?: ReportColumn[] | string | string[];
};

export type ReportColumn =
  | 'name'
  | 'preferredName'
  | 'cpf'
  | 'birthDate'
  | 'gender'
  | 'shirtSize'
  | 'shirtType'
  | 'typeInscription';

export type GeneratePdfLocalityOutput = {
  fileBase64: string;
  filename: string;
  contentType: 'application/pdf' | 'application/zip';
};

export type ReportSummary = {
  totalParticipants: number;
  genderCount: Record<string, number>;
  shirtSizeCount: Record<string, number>;
};

@Injectable()
export class GeneratePdfLocalityUsecase
  implements Usecase<GeneratePdfLocalityInput, GeneratePdfLocalityOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountGateway: AccountGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  async execute(
    input: GeneratePdfLocalityInput,
  ): Promise<GeneratePdfLocalityOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event with id ${input.eventId} not found`,
        `Evento não encontrado`,
        GeneratePdfLocalityUsecase.name,
      );
    }

    const inscriptions = await this.inscriptionGateway.findByLocality(
      event.getId(),
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
    const pdfGenerator = input.reduced
      ? ParticipantsByLocalitySummarizedPdfGenerator
      : ParticipantsByLocalityPdfGenerator;

    const eventHeaderImagePath = event.getLogoUrl() || event.getImageUrl();
    const eventHeaderImageBase64 = await this.getImageBase64(
      eventHeaderImagePath,
    );

    // Converter columns de string para array se necessário
    const columnsArray = this.parseColumns(input.columns);

    // Aplicar filtro de colunas aos dados
    const filteredRows = this.filterRowsByColumns(rows, columnsArray);

    // Calcular resumo se solicitado
    const summary = input.summary ? this.generateSummary(rows) : undefined;

    // Determinar se deve usar orientação horizontal (landscape)
    // Landscape apenas se MAIS de 4 colunas forem solicitadas
    const columnsCount = columnsArray ? columnsArray.length : 0;
    const isLandscape = columnsCount > 4;

    if (!input.separate || filteredRows.length === 0) {
      const header = {
        title: event.getName()
          ? `Lista de Participantes: ${event.getName()}`
          : 'Lista de Participantes',
        titleDetail: `${filteredRows.length} participante(s)`,
        image: eventHeaderImageBase64 || undefined,
      };

      const pdfBuffer = await pdfGenerator.generateReportPdf({
        header,
        participants: filteredRows,
        summary,
        columns: columnsArray,
        isLandscape,
      });

      const filename = `Lista-de-Participantes-${eventSlug}-${dateSlug}.pdf`;

      return {
        fileBase64: pdfBuffer.toString('base64'),
        filename,
        contentType: 'application/pdf',
      };
    }

    const byLocality = new Map<string, typeof filteredRows>();
    for (const row of filteredRows) {
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
    const pdfEntries = await Promise.all(
      sortedLocalities.map(async (locality) => {
        const participants = (byLocality.get(locality) ?? []).map((p, idx) => ({
          ...p,
          index: idx + 1,
        }));

        const header = {
          title: event.getName()
            ? `Lista de Participantes: ${event.getName()}`
            : 'Lista de Participantes',
          titleDetail: `${participants.length} participante(s)`,
          image: eventHeaderImageBase64 || undefined,
        };

        const pdfBuffer = await pdfGenerator.generateReportPdf({
          header,
          participants,
          summary,
          columns: columnsArray,
          isLandscape,
        });

        const localityLabel = locality === '-' ? 'sem-localidade' : locality;
        const baseName = this.slugify(localityLabel) || 'localidade';
        const count = (nameCounts.get(baseName) ?? 0) + 1;
        nameCounts.set(baseName, count);

        const localitySlug = count === 1 ? baseName : `${baseName}-${count}`;
        const filename = `Lista-de-Participantes-${eventSlug}-${localitySlug}-${dateSlug}.pdf`;

        return { filename, buffer: pdfBuffer };
      }),
    );

    const zipBuffer = await this.zipFiles(pdfEntries);
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

  private async getPublicUrl(path?: string): Promise<string> {
    if (!path) return '';

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }

  private async getImageBase64(path?: string): Promise<string> {
    const publicUrl = await this.getPublicUrl(path);
    if (!publicUrl) return '';

    try {
      const response = await axios.get<ArrayBuffer>(publicUrl, {
        responseType: 'arraybuffer',
      });

      const base64Image = Buffer.from(response.data).toString('base64');
      // Keep the same data-uri approach used in other PDF usecases.
      return `data:image/jpeg;base64,${base64Image}`;
    } catch {
      return '';
    }
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

  private parseColumns(
    columns?: ReportColumn[] | string | string[],
  ): ReportColumn[] | undefined {
    if (!columns) return undefined;

    const allowed: ReadonlySet<ReportColumn> = new Set<ReportColumn>([
      'name',
      'preferredName',
      'cpf',
      'birthDate',
      'gender',
      'shirtSize',
      'shirtType',
      'typeInscription',
    ]);

    const rawTokens: string[] = [];
    const pushTokens = (value: string) => {
      for (const token of value.split(',')) rawTokens.push(token);
    };

    if (Array.isArray(columns)) {
      for (const item of columns) pushTokens(String(item ?? ''));
    } else {
      pushTokens(String(columns ?? ''));
    }

    const normalized: ReportColumn[] = [];
    const seen = new Set<string>();
    for (const token of rawTokens) {
      const col = token.trim();
      if (!col) continue;
      if (seen.has(col)) continue;
      if (!allowed.has(col as ReportColumn)) continue;
      seen.add(col);
      normalized.push(col as ReportColumn);
    }

    return normalized.length > 0 ? normalized : undefined;
  }

  private generateSummary(rows: Array<any>): ReportSummary {
    const genderCount: Record<string, number> = {};
    const shirtSizeCount: Record<string, number> = {};

    for (const row of rows) {
      if (row.gender) {
        genderCount[row.gender] = (genderCount[row.gender] || 0) + 1;
      }
      if (row.shirtSize) {
        shirtSizeCount[row.shirtSize] =
          (shirtSizeCount[row.shirtSize] || 0) + 1;
      }
    }

    return {
      totalParticipants: rows.length,
      genderCount,
      shirtSizeCount,
    };
  }

  private filterRowsByColumns(
    rows: Array<any>,
    columns?: ReportColumn[],
  ): Array<any> {
    if (!columns || columns.length === 0) {
      return rows;
    }

    const shouldInclude = (key: string): boolean => {
      return columns.includes(key as ReportColumn);
    };

    return rows.map((row) => {
      const filtered: any = {
        index: row.index,
        locality: row.locality,
      };

      if (shouldInclude('name')) filtered.name = row.name;
      if (shouldInclude('preferredName'))
        filtered.preferredName = row.preferredName;
      // We expose "Idade" when "birthDate" is requested.
      if (shouldInclude('birthDate')) filtered.age = row.age;
      if (shouldInclude('gender')) filtered.gender = row.gender;
      if (shouldInclude('shirtSize')) filtered.shirtSize = row.shirtSize;
      if (shouldInclude('shirtType')) filtered.shirtType = row.shirtType;

      return filtered;
    });
  }
}
