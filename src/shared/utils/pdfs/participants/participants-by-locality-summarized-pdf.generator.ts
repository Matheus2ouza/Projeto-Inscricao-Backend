import { ShirtSize, ShirtType } from 'generated/prisma';
import path from 'path';
import PdfPrinter from 'pdfmake';
import { buildPdfHeaderSection } from '../common/pdf-header.util';

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

export type ParticipantLocalitySummarizedPdfRow = {
  index: number;
  name: string;
  preferredName?: string;
  locality: string;
  age: number;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
};

export type ParticipantLocalitySummarizedPdfData = {
  eventName: string;
  participants: ParticipantLocalitySummarizedPdfRow[];
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
    const headerContent = buildPdfHeaderSection({
      title: data.eventName
        ? `Lista de Participantes: ${data.eventName}`
        : 'Lista de Participantes',
      titleDetail: `${data.participants.length} participante(s)`,
    });

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

    const content: any[] = [...headerContent];

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
        buildParticipantsTable(participants),
      );
    }

    const docDefinition: any = {
      pageSize: 'A4',
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
) {
  const body = [
    [
      { text: '#', style: 'tableHeader' },
      { text: 'Nome', style: 'tableHeader' },
      { text: 'Como ser chamado', style: 'tableHeader' },
      { text: 'Idade', style: 'tableHeader' },
      { text: 'Tam.', style: 'tableHeader' },
      { text: 'Tipo', style: 'tableHeader' },
    ],
    ...participants.map((p, index) => {
      const localIndex = index + 1;
      const preferredName =
        p.preferredName && p.preferredName.trim().length > 0
          ? p.preferredName
          : '-';

      return [
        { text: String(localIndex), style: 'tableCell' },
        { text: p.name || '-', style: 'tableCell' },
        { text: preferredName, style: 'tableCell' },
        { text: String(p.age ?? '-'), style: 'tableCell' },
        { text: formatShirtSize(p.shirtSize), style: 'tableCell' },
        { text: formatShirtType(p.shirtType), style: 'tableCell' },
      ];
    }),
  ];

  return {
    table: {
      headerRows: 1,
      widths: [18, '*', 110, 30, 40, 70],
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

function formatShirtSize(size?: ShirtSize | null): string {
  if (!size) return '-';
  return String(size);
}

function formatShirtType(type?: ShirtType | null): string {
  if (!type) return '-';
  return String(type);
}
