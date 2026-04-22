import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
import path from 'path';
import PdfPrinter from 'pdfmake';
import {
  buildPdfHeaderSection,
  PdfHeaderDefinition,
} from '../common/pdf-header.util';
import {
  buildParticipantsByLocalitySummarySection,
  participantsByLocalitySummaryStyles,
  type ParticipantLocalityReportSummary,
} from './common/participants-by-locality-summary-section.util';

const fontsPath = path.join(process.cwd(), 'public', 'fonts');

const fonts = {
  OpenSans: {
    normal: path.join(fontsPath, 'OpenSans', 'normal', 'OpenSans-Regular.ttf'),
    bold: path.join(fontsPath, 'OpenSans', 'normal', 'OpenSans-Bold.ttf'),
    italics: path.join(fontsPath, 'OpenSans', 'Italic', 'OpenSans-Italic.ttf'),
    bolditalics: path.join(
      fontsPath,
      'OpenSans',
      'Italic',
      'OpenSans-SemiBoldItalic.ttf',
    ),
  },
};

const printer = new PdfPrinter(fonts);

export type ReportColumn =
  | 'name'
  | 'preferredName'
  | 'cpf'
  | 'birthDate'
  | 'gender'
  | 'shirtSize'
  | 'shirtType'
  | 'typeInscription';

export type ReportSummary = {
  totalParticipants: number;
  genderCount: Record<string, number>;
  shirtSizeCount: Record<string, number>;
};

export type ParticipantLocalityPdfRow = {
  index: number;
  name?: string;
  preferredName?: string;
  locality: string;
  age?: number;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender?: genderType;
};

export type ParticipantLocalityPdfData = {
  header: PdfHeaderDefinition;
  participants: ParticipantLocalityPdfRow[];
  summary?: ReportSummary;
  columns?: ReportColumn[];
  isLandscape?: boolean;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(date: Date) {
  const d = new Date(date);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export class ParticipantsByLocalityPdfGenerator {
  public static generateReportPdf(
    data: ParticipantLocalityPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection(data.header);

    const content: any[] = [...headerContent];

    // Adicionar resumo se fornecido
    if (data.summary) {
      const summaryContent = buildParticipantsByLocalitySummarySection({
        summary: data.summary as ParticipantLocalityReportSummary,
        formatGender: (g) => formatGender(g as genderType),
      });
      // Summary should be isolated on its own page.
      content.push(...summaryContent, { text: '', pageBreak: 'after' });
    }

    const groups = new Map<string, ParticipantLocalityPdfRow[]>();
    for (const participant of data.participants) {
      const locality = participant.locality || '-';
      const list = groups.get(locality) ?? [];
      list.push(participant);
      groups.set(locality, list);
    }

    const sortedLocalities = [...groups.keys()].sort((a, b) => {
      if (a === '-' && b !== '-') return 1;
      if (a !== '-' && b === '-') return -1;
      return a.localeCompare(b, 'pt-BR');
    });

    for (
      let localityIndex = 0;
      localityIndex < sortedLocalities.length;
      localityIndex += 1
    ) {
      const locality = sortedLocalities[localityIndex];
      const participants = groups.get(locality) ?? [];

      content.push(
        {
          text: String(locality).toUpperCase(),
          style: 'sectionTitle',
          margin: [0, 10, 0, 8],
        },
        ...buildParticipantBlocks(participants, data.columns),
      );

      if (localityIndex < sortedLocalities.length - 1) {
        content.push({ text: '', pageBreak: 'after' });
      }
    }

    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: data.isLandscape ? 'landscape' : 'portrait',
      pageMargins: [40, 60, 40, 60],
      footer: (currentPage: number, pageCount: number) => ({
        text:
          currentPage === pageCount
            ? `Gerado em ${formatDate(new Date())}`
            : '',
        style: 'footer',
        alignment: 'center',
        margin: [40, 10, 40, 0],
      }),
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        lineHeight: 1.3,
      },
      content,
      styles: {
        headerTitle: {
          fontSize: 20,
          bold: true,
          color: '#1a365d',
          lineHeight: 1.15,
        },
        headerTitleDetail: {
          fontSize: 11,
          color: '#2d3748',
          lineHeight: 1.3,
        },
        sectionTitle: {
          fontSize: 13,
          bold: true,
          color: '#2d3748',
        },
        labelText: {
          fontSize: 10,
          bold: true,
          color: '#2d3748',
          margin: [0, 0, 0, 2],
        },
        valueText: {
          fontSize: 10,
          color: '#1a202c',
        },
        participantTitle: {
          fontSize: 13,
          bold: true,
          color: '#2d3748',
        },
        summarySection: {
          fontSize: 11,
          bold: true,
          color: '#2d3748',
          margin: [0, 8, 0, 6],
        },
        ...participantsByLocalitySummaryStyles,
        footer: {
          fontSize: 9,
          color: '#4a5568',
        },
      },
    };

    return new Promise((resolve, reject) => {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }
}

function buildParticipantBlocks(
  participants: ParticipantLocalityPdfRow[],
  columns?: ReportColumn[],
) {
  return participants.map((p, index) => {
    const localIndex = index + 1;
    const nameLine = p.name || '-';
    const preferredName =
      p.preferredName && p.preferredName.trim().length > 0
        ? p.preferredName
        : undefined;

    const shouldShow = (col: ReportColumn) => !columns || columns.includes(col);
    const shouldShowAge = shouldShow('birthDate');

    return {
      unbreakable: true,
      stack: [
        { text: `#${localIndex} - ${nameLine}`, style: 'participantTitle' },
        {
          columns: [
            shouldShow('name') && {
              width: '25%',
              stack: [
                { text: 'Nome', style: 'labelText' },
                { text: p.name || '-', style: 'valueText' },
              ],
            },
            shouldShow('preferredName') && {
              width: '25%',
              stack: [
                { text: 'Como ser chamado', style: 'labelText' },
                { text: preferredName || '-', style: 'valueText' },
              ],
            },
            {
              width: '25%',
              stack: [
                { text: 'Localidade', style: 'labelText' },
                { text: p.locality || '-', style: 'valueText' },
              ],
            },
            shouldShowAge && {
              width: '25%',
              stack: [
                { text: 'Idade', style: 'labelText' },
                { text: String(p.age ?? '-'), style: 'valueText' },
              ],
            },
          ].filter(Boolean),
          margin: [0, 6, 0, 0],
        },
        {
          columns: [
            shouldShow('gender') && {
              width: '33%',
              stack: [
                { text: 'Gênero', style: 'labelText' },
                { text: formatGender(p.gender), style: 'valueText' },
              ],
            },
            shouldShow('shirtSize') && {
              width: '33%',
              stack: [
                { text: 'Tamanho', style: 'labelText' },
                { text: formatShirtSize(p.shirtSize), style: 'valueText' },
              ],
            },
            shouldShow('shirtType') && {
              width: '34%',
              stack: [
                { text: 'Tipo', style: 'labelText' },
                { text: formatShirtType(p.shirtType), style: 'valueText' },
              ],
            },
          ].filter(Boolean),
          margin: [0, 18, 0, 0],
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 531,
              y2: 0,
              lineWidth: 1,
              lineColor: '#e5e7eb',
            },
          ],
          margin: [0, 12, 0, 0],
        },
      ],
      margin: [0, index === 0 ? 0 : 12, 0, 0],
    };
  });
}

function formatGender(gender?: genderType | string | null): string {
  if (!gender) return '-';
  switch (gender) {
    case 'MASCULINO':
      return 'Masculino';
    case 'FEMININO':
      return 'Feminino';
    default:
      return String(gender);
  }
}

function formatShirtSize(size?: ShirtSize | null): string {
  if (!size) return '-';
  return String(size);
}

function formatShirtType(type?: ShirtType | null): string {
  if (!type) return '-';
  return String(type);
}
