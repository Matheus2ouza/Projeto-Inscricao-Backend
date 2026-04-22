import { ShirtSize, ShirtType } from 'generated/prisma';
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

export type ParticipantLocalitySummarizedPdfRow = {
  index: number;
  name?: string;
  preferredName?: string;
  locality: string;
  age?: number;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender?: any;
};

export type ParticipantLocalitySummarizedPdfData = {
  header: PdfHeaderDefinition;
  participants: ParticipantLocalitySummarizedPdfRow[];
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

export class ParticipantsByLocalitySummarizedPdfGenerator {
  public static generateReportPdf(
    data: ParticipantLocalitySummarizedPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection(data.header);

    const content: any[] = [...headerContent];

    // Adicionar resumo se fornecido
    if (data.summary) {
      const summaryContent = buildParticipantsByLocalitySummarySection({
        summary: data.summary as ParticipantLocalityReportSummary,
        formatGender: (g) => formatGender(g),
      });
      // Summary should be isolated on its own page.
      content.push(...summaryContent, { text: '', pageBreak: 'after' });
    }

    const groups = new Map<string, ParticipantLocalitySummarizedPdfRow[]>();
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
          margin: [0, 15, 0, 8],
        },
        buildParticipantsTable(participants, data.columns),
      );
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
        tableHeader: {
          fontSize: 9,
          bold: true,
          color: '#2d3748',
        },
        tableCell: {
          fontSize: 9,
          color: '#1a202c',
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
        summaryLabel: {
          fontSize: 10,
          bold: true,
          color: '#4a5568',
        },
        summaryValue: {
          fontSize: 11,
          color: '#1a202c',
          margin: [0, 0, 0, 4],
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

function buildParticipantsTable(
  participants: ParticipantLocalitySummarizedPdfRow[],
  columns?: ReportColumn[],
) {
  const shouldShow = (col: ReportColumn) => !columns || columns.includes(col);
  const shouldShowAge = shouldShow('birthDate');

  // Construir headers e definir ordem de colunas
  const columnConfig: Array<{
    key: string;
    header: string;
    width: number | string;
  }> = [{ key: 'index', header: '#', width: 18 }];

  if (shouldShow('name')) {
    columnConfig.push({ key: 'name', header: 'Nome', width: '*' });
  }

  if (shouldShow('preferredName')) {
    columnConfig.push({
      key: 'preferredName',
      header: 'Como ser chamado',
      width: 100,
    });
  }

  if (shouldShowAge) {
    columnConfig.push({ key: 'age', header: 'Idade', width: 30 });
  }

  if (shouldShow('gender')) {
    columnConfig.push({ key: 'gender', header: 'Gênero', width: 50 });
  }

  if (shouldShow('shirtSize')) {
    columnConfig.push({ key: 'shirtSize', header: 'Tam.', width: 40 });
  }

  if (shouldShow('shirtType')) {
    columnConfig.push({ key: 'shirtType', header: 'Tipo', width: 70 });
  }

  // Construir headers
  const headerCells = columnConfig.map((col) => ({
    text: col.header,
    style: 'tableHeader',
  }));

  // Construir linhas de dados
  const body = [
    headerCells,
    ...participants.map((p, index) => {
      const localIndex = index + 1;
      const preferredName =
        p.preferredName && p.preferredName.trim().length > 0
          ? p.preferredName
          : '-';

      const cells: any[] = [];

      for (const col of columnConfig) {
        switch (col.key) {
          case 'index':
            cells.push({ text: String(localIndex), style: 'tableCell' });
            break;
          case 'name':
            cells.push({ text: p.name || '-', style: 'tableCell' });
            break;
          case 'preferredName':
            cells.push({ text: preferredName, style: 'tableCell' });
            break;
          case 'age':
            cells.push({ text: String(p.age ?? '-'), style: 'tableCell' });
            break;
          case 'gender':
            cells.push({ text: formatGender(p.gender), style: 'tableCell' });
            break;
          case 'shirtSize':
            cells.push({
              text: formatShirtSize(p.shirtSize),
              style: 'tableCell',
            });
            break;
          case 'shirtType':
            cells.push({
              text: formatShirtType(p.shirtType),
              style: 'tableCell',
            });
            break;
        }
      }

      return cells;
    }),
  ];

  const widths = columnConfig.map((col) => col.width);

  return {
    table: {
      headerRows: 1,
      widths,
      body,
    },
    layout: {
      fillColor: (rowIndex: number) => (rowIndex === 0 ? '#edf2f7' : null),
      hLineColor: () => '#e5e7eb',
      vLineColor: () => '#e5e7eb',
      hLineWidth: (i: number) => (i === 0 ? 1 : 0.5),
      vLineWidth: () => 0.5,
      paddingLeft: () => 3,
      paddingRight: () => 3,
      paddingTop: (rowIndex: number) => (rowIndex === 0 ? 3 : 2),
      paddingBottom: (rowIndex: number) => (rowIndex === 0 ? 3 : 2),
    },
  };
}

function formatGender(gender?: any): string {
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
