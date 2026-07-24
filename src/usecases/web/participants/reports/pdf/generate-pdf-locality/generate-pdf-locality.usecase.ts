import { Injectable } from '@nestjs/common';
import archiver from 'archiver';
import axios from 'axios';
import { InscriptionStatus } from 'generated/prisma';
import sharp from 'sharp';
import { AccountParticipantGateway } from 'src/domain/repositories/account-participant.geteway';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
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
  // filtros
  typeInscriptions?: string | string[];
  columns?: ReportColumn[] | string | string[];
  inscriptionsStatus?: InscriptionStatus | InscriptionStatus[];
  startDate?: string;
  endDate?: string;
};

export type ReportColumn =
  | 'name'
  | 'preferredName'
  | 'cpf'
  | 'birthDate'
  | 'phone'
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
    private readonly localityGateway: LocalityGateway,
    private readonly accountGateway: AccountGateway,
    private readonly accountParticipantGateway: AccountParticipantGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
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

    const filters = {
      status: input.inscriptionsStatus,
      typeInscriptionId: input.typeInscriptions,
      startDate: input.startDate,
      endDate: input.endDate,
    };

    const inscriptions = await this.inscriptionGateway.findByLocality(
      event.getId(),
      filters,
    );

    const inscriptionIds = inscriptions.map((inscription) =>
      inscription.getId(),
    );

    const phoneByInscriptionId = new Map(
      inscriptions.map(
        (inscription) => [inscription.getId(), inscription.getPhone()] as const,
      ),
    );

    // localidade agora vem da inscrição, resolvida em lote
    const localityIds = [
      ...new Set(
        inscriptions
          .map((i) => i.getLocalityId())
          .filter((id): id is string => !!id),
      ),
    ];

    const localities = await this.localityGateway.findByIds(localityIds);
    const localityNameById = new Map(
      localities.map((l) => [l.getId(), l.getName()] as const),
    );

    const localityByInscriptionId = new Map(
      inscriptions.map((i) => {
        const id = i.getLocalityId();
        return [i.getId(), (id && localityNameById.get(id)) || '-'] as const;
      }),
    );

    const rowsNormal = await this.fetchNormalParticipants(
      inscriptions,
      localityByInscriptionId,
    );

    const rowsGuest = await this.fetchGuestParticipants(
      inscriptionIds,
      filters,
      phoneByInscriptionId,
      localityByInscriptionId,
    );

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
    const eventHeaderImageBase64 =
      await this.getImageBase64(eventHeaderImagePath);

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

      // normaliza qualquer formato para PNG, garantindo compatibilidade com pdfmake
      const pngBuffer = await sharp(Buffer.from(response.data))
        .png()
        .toBuffer();

      return `data:image/png;base64,${pngBuffer.toString('base64')}`;
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
      'phone',
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
      if (shouldInclude('phone')) filtered.phone = row.phone;
      if (shouldInclude('gender')) filtered.gender = row.gender;
      if (shouldInclude('shirtSize')) filtered.shirtSize = row.shirtSize;
      if (shouldInclude('shirtType')) filtered.shirtType = row.shirtType;
      if (shouldInclude('typeInscription'))
        filtered.typeInscription = row.typeInscription;

      return filtered;
    });
  }

  private async fetchNormalParticipants(
    inscriptions: any[],
    localityByInscriptionId: Map<string, string>,
  ): Promise<Array<any>> {
    const rowsNormal = (
      await Promise.all(
        inscriptions.map(async (inscription) => {
          const participantsNormalArray =
            await this.accountParticipantGateway.findByInscriptionId(
              inscription.getId(),
            );

          const locality =
            localityByInscriptionId.get(inscription.getId()) ?? '-';

          return Promise.all(
            participantsNormalArray.map(async (pn) => {
              const typeInscription =
                await this.typeInscriptionGateway.findTypeInscriptionByAccountParticipantInEventId(
                  pn.getId(),
                );

              return {
                name: pn.getName(),
                preferredName: pn.getPreferredName(),
                locality,
                age: this.calculateAge(pn.getBirthDate()),
                phone: inscription.getPhone(),
                shirtSize: pn.getShirtSize(),
                shirtType: pn.getShirtType(),
                gender: pn.getGender(),
                typeInscription:
                  typeInscription?.getDescription() ?? 'Não informado',
              };
            }),
          );
        }),
      )
    ).flat();

    return rowsNormal;
  }

  private async fetchGuestParticipants(
    inscriptionIds: string[],
    filters: any,
    phoneByInscriptionId: Map<string, string>,
    localityByInscriptionId: Map<string, string>,
  ): Promise<Array<any>> {
    const participantsGuest =
      await this.participantGateway.findByInscriptionsIds(
        inscriptionIds,
        filters,
      );

    const rowsGuest = await Promise.all(
      participantsGuest.map(async (pg) => {
        const locality =
          localityByInscriptionId.get(pg.getInscriptionId()) ?? '-';

        const typeInscription = await this.typeInscriptionGateway.findById(
          pg.getTypeInscriptionId(),
        );
        return {
          name: pg.getName(),
          preferredName: pg.getPreferredName(),
          locality,
          age: this.calculateAge(pg.getBirthDate()),
          phone: phoneByInscriptionId.get(pg.getInscriptionId()),
          shirtSize: pg.getShirtSize(),
          shirtType: pg.getShirtType(),
          gender: pg.getGender(),
          typeInscription: typeInscription?.getDescription() ?? 'Não informado',
        };
      }),
    );

    return rowsGuest;
  }
}
