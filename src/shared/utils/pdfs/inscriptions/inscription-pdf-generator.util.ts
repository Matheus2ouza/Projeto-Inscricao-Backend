import { genderType } from 'generated/prisma';
import path from 'path';
import PdfPrinter from 'pdfmake';
import {
  buildPdfHeaderSection,
  PdfHeaderDefinition,
} from '../common/pdf-header.util';

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

export type InscriptionPdfParticipant = {
  name: string;
  birthDate: Date;
  gender: genderType;
};

export type InscriptionPdfData = {
  header: PdfHeaderDefinition;
  id: string;
  responsible: string;
  createAt: Date;
  event: {
    name?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
  };
  participants: InscriptionPdfParticipant[];
};

export class InscriptionPdfGeneratorUtils {
  public static generateInscriptionListPdf(
    data: InscriptionPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection(data.header);

    // Conteúdo dos dados da inscrição em formato de seções
    const inscriptionDataContent = [
      {
        text: 'DADOS DA INSCRIÇÃO',
        style: 'sectionTitle',
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              {
                text: 'Responsável pela inscrição:',
                style: 'labelText',
                margin: [0, 0, 0, 2],
              },
              {
                text: data.responsible,
                style: 'valueText',
                margin: [0, 0, 0, 16],
              },
            ],
          },
          {
            width: '50%',
            stack: [
              {
                text: 'Data da inscrição:',
                style: 'labelText',
                margin: [0, 0, 0, 2],
              },
              {
                text: formatDateTime(data.createAt),
                style: 'valueText',
                margin: [0, 0, 0, 16],
              },
            ],
          },
        ],
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: 515,
            y2: 0,
            lineWidth: 1,
            lineColor: '#e2e8f0',
          },
        ],
        margin: [0, 16, 0, 24],
      },
    ];

    const participantsTableBody = [
      [
        { text: '#', style: 'tableHeader', alignment: 'center' },
        { text: 'Nome completo', style: 'tableHeader', alignment: 'left' },
        {
          text: 'Data Nasc.',
          style: 'tableHeader',
          alignment: 'center',
        },
        { text: 'Idade', style: 'tableHeader', alignment: 'center' },
        { text: 'Gênero', style: 'tableHeader', alignment: 'center' },
      ],
      ...this.buildParticipantRows(data.participants),
    ];

    const generatedAt = new Date();

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        lineHeight: 1.3,
      },
      content: [
        ...headerContent,
        ...inscriptionDataContent,
        {
          text: `LISTA DE PARTICIPANTES - ${data.participants.length} participantes`,
          style: 'sectionTitle',
          margin: [0, 12, 0, 8],
        },
        {
          table: {
            headerRows: 1,
            widths: ['8%', '42%', '20%', '15%', '15%'],
            body: participantsTableBody,
          },
          layout: {
            hLineWidth: (i: number, node: any) =>
              i === 0 || i === node.table.body.length ? 2 : 1,
            vLineWidth: (i: number, node: any) =>
              i === 0 || i === node.table.widths.length ? 2 : 1,
            hLineColor: (i: number, node: any) =>
              i === 0 || i === node.table.body.length ? '#2d3748' : '#e2e8f0',
            vLineColor: (i: number, node: any) =>
              i === 0 || i === node.table.widths.length ? '#2d3748' : '#e2e8f0',
          },
        },
      ],
      footer: (currentPage: number, pageCount: number) =>
        currentPage === pageCount
          ? {
              margin: [40, 0, 40, 30],
              text: `Documento gerado em ${formatDateTime(generatedAt)}`,
              style: 'footer',
              alignment: 'center',
            }
          : null,
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
        headerSubtitle: {
          fontSize: 16,
          bold: true,
          color: '#2d3748',
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
        },
        valueText: {
          fontSize: 10,
          color: '#1a202c',
        },
        tableHeader: {
          fontSize: 11,
          bold: true,
          fillColor: '#e2e8f0',
          color: '#1a202c',
        },
        tableRow: {
          fontSize: 10,
          color: '#1a202c',
        },
        footer: {
          fontSize: 9,
          color: '#4a5568',
        },
        pageNumber: {
          fontSize: 9,
          color: '#718096',
        },
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Buffer[] = [];

    return new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  private static buildEventPeriod(data: InscriptionPdfData): string {
    const start = data.event.startDate
      ? formatDate(data.event.startDate)
      : undefined;
    const end = data.event.endDate ? formatDate(data.event.endDate) : undefined;

    if (start && end) {
      return `${start} até ${end}`;
    }

    return start ?? end ?? '-';
  }

  private static buildParticipantRows(
    participants: InscriptionPdfParticipant[],
  ) {
    if (!participants.length) {
      return [
        [
          {
            text: 'Nenhum participante cadastrado para esta inscrição.',
            style: 'tableRow',
            italics: true,
            colSpan: 5,
            alignment: 'center',
          },
          {},
          {},
          {},
          {},
        ],
      ];
    }

    return participants.map((participant, index) => [
      {
        text: (index + 1).toString(),
        alignment: 'center',
        style: 'tableRow',
      },
      { text: participant.name, style: 'tableRow' },
      {
        text: formatDate(participant.birthDate),
        alignment: 'center',
        style: 'tableRow',
      },
      {
        text: formatAge(participant.birthDate),
        alignment: 'center',
        style: 'tableRow',
      },
      {
        text: formatGender(participant.gender),
        alignment: 'center',
        style: 'tableRow',
      },
    ]);
  }
}

function formatDate(date?: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('pt-BR');
}

function formatAge(date?: Date | null): string {
  if (!date) return '-';
  const birth = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? `${age}` : '-';
}

function formatGender(gender?: genderType | null): string {
  if (!gender) return 'Não informado';

  switch (gender) {
    case 'MASCULINO':
      return 'Masculino';
    case 'FEMININO':
      return 'Feminino';
    default:
      return String(gender).charAt(0) + String(gender).slice(1).toLowerCase();
  }
}
