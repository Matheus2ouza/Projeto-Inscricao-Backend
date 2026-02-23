import {
  genderType,
  InscriptionStatus,
  ShirtSize,
  ShirtType,
} from 'generated/prisma';
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

export type ListInscriptionsPdfParticipant = {
  name: string;
  birthDate: Date;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender: genderType;
};

export type ListInscriptionsPdfInscription = {
  id: string;
  responsible: string;
  locality: string;
  status: InscriptionStatus;
  createdAt: Date;
  isGuest?: boolean;
  participants?: ListInscriptionsPdfParticipant[];
};

export type ListInscriptionsPdfData = {
  header: PdfHeaderDefinition;
  inscriptions: ListInscriptionsPdfInscription[];
  totals?: {
    totalInscriptions?: number;
    totalAccountParticipants: number;
    totalGuestParticipants: number;
  };
};

export class ListInscriptionsPdfGeneratorUtils {
  public static generateListInscriptionsPdf(
    data: ListInscriptionsPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection(data.header);

    const totals =
      data.totals?.totalInscriptions != null
        ? [
            {
              columns: [
                {
                  width: '50%',
                  stack: [
                    { text: 'Total de inscrições', style: 'labelText' },
                    {
                      text: String(data.totals.totalInscriptions),
                      style: 'valueText',
                    },
                  ],
                },
                {
                  width: '50%',
                  stack: [
                    { text: ' ', style: 'labelText' },
                    { text: ' ', style: 'valueText' },
                  ],
                },
              ],
              margin: [0, 0, 0, 10],
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
              margin: [0, 0, 0, 16],
            },
          ]
        : [];

    const content = [
      ...headerContent,
      ...totals,
      ...this.buildInscriptionsContent(data.inscriptions, data.totals),
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
      content,
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
        inscriptionTitle: {
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
        tableHeader: {
          fontSize: 9,
          bold: true,
          fillColor: '#e2e8f0',
          color: '#1a202c',
        },
        tableRow: {
          fontSize: 8,
          color: '#1a202c',
        },
        badge: {
          fontSize: 9,
          bold: true,
          color: '#ffffff',
        },
        footer: {
          fontSize: 9,
          color: '#4a5568',
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

  private static buildInscriptionsContent(
    inscriptions: ListInscriptionsPdfInscription[],
    totals?: ListInscriptionsPdfData['totals'],
  ) {
    if (!inscriptions.length) {
      return [
        {
          text: 'Nenhuma inscrição encontrada.',
          italics: true,
          alignment: 'center',
          margin: [0, 40, 0, 0],
        },
      ];
    }

    const allocatedInscriptions = inscriptions.filter((i) => !i.isGuest);
    const guestInscriptions = inscriptions.filter((i) => i.isGuest);

    const allocatedQuantity =
      totals?.totalAccountParticipants ??
      (() => {
        const sum = allocatedInscriptions.reduce(
          (acc, i) => acc + (i.participants?.length ?? 0),
          0,
        );
        return sum || allocatedInscriptions.length;
      })();

    const guestQuantity =
      totals?.totalGuestParticipants ??
      (() => {
        const sum = guestInscriptions.reduce(
          (acc, i) => acc + (i.participants?.length ?? 0),
          0,
        );
        return sum || guestInscriptions.length;
      })();

    const content: any[] = [];

    if (allocatedInscriptions.length) {
      content.push({
        text: `Participantes (${allocatedQuantity})`,
        style: 'sectionTitle',
        margin: [0, 0, 0, 12],
      });
      content.push(...this.buildInscriptionBlocks(allocatedInscriptions));
    }

    if (guestInscriptions.length) {
      content.push({
        text: `Participantes não alocados (${guestQuantity})`,
        style: 'sectionTitle',
        margin: [0, content.length ? 24 : 0, 0, 12],
      });
      content.push(...this.buildInscriptionBlocks(guestInscriptions));
    }

    return content;
  }

  private static buildInscriptionBlocks(
    inscriptions: ListInscriptionsPdfInscription[],
  ) {
    return inscriptions.map((inscription, index) => {
      const details = [
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Responsável', style: 'labelText' },
                { text: inscription.responsible || '-', style: 'valueText' },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'Localidade', style: 'labelText' },
                { text: inscription.locality || '-', style: 'valueText' },
              ],
            },
          ],
          margin: [0, 0, 0, 8],
        },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Data da inscrição', style: 'labelText' },
                {
                  text: formatDateTime(inscription.createdAt),
                  style: 'valueText',
                },
              ],
            },
            {
              width: '50%',
              stack: [
                { text: 'Status', style: 'labelText' },
                buildStatusBadge(inscription.status),
              ],
            },
          ],
          margin: [0, 0, 0, 10],
        },
      ];

      const participantsBlock = inscription.participants
        ? [
            {
              text: `Participantes (${inscription.participants.length})`,
              style: 'labelText',
              margin: [0, 6, 0, 4],
            },
            buildParticipantsTable(inscription.participants),
          ]
        : [];

      return {
        unbreakable: true,
        stack: [
          {
            text: `Inscrição ${formatId(inscription.id)}`,
            style: 'inscriptionTitle',
            margin: [0, 0, 0, 8],
          },
          ...details,
          ...participantsBlock,
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
            margin: [0, 16, 0, 0],
          },
        ],
        margin: [0, index === 0 ? 0 : 16, 0, 0],
      };
    });
  }
}

function buildParticipantsTable(
  participants: ListInscriptionsPdfParticipant[],
) {
  return {
    table: {
      headerRows: 1,
      widths: ['6%', '30%', '16%', '16%', '16%', '16%'],
      body: [
        [
          { text: '#', style: 'tableHeader', alignment: 'center' },
          { text: 'Nome', style: 'tableHeader' },
          { text: 'Idade', style: 'tableHeader', alignment: 'center' },
          { text: 'Tamanho', style: 'tableHeader', alignment: 'center' },
          { text: 'Tipo', style: 'tableHeader', alignment: 'center' },
          { text: 'Gênero', style: 'tableHeader', alignment: 'center' },
        ],
        ...buildParticipantRows(participants),
      ],
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
    margin: [0, 0, 0, 8],
  };
}

function buildParticipantRows(participants: ListInscriptionsPdfParticipant[]) {
  if (!participants.length) {
    return [
      [
        {
          text: 'Nenhum participante cadastrado para esta inscrição.',
          style: 'tableRow',
          italics: true,
          colSpan: 6,
          alignment: 'center',
        },
        {},
        {},
        {},
        {},
        {},
      ],
    ];
  }

  return participants.map((participant, index) => [
    { text: String(index + 1), style: 'tableRow', alignment: 'center' },
    { text: participant.name || '-', style: 'tableRow' },
    {
      text: formatAge(participant.birthDate),
      style: 'tableRow',
      alignment: 'center',
    },
    {
      text: formatShirtSize(participant.shirtSize),
      style: 'tableRow',
      alignment: 'center',
    },
    {
      text: formatShirtType(participant.shirtType),
      style: 'tableRow',
      alignment: 'center',
    },
    {
      text: formatGender(participant.gender),
      style: 'tableRow',
      alignment: 'center',
    },
  ]);
}

function buildStatusBadge(status: InscriptionStatus): any {
  const { label, color } = formatStatus(status);

  return {
    table: {
      widths: ['auto'],
      body: [[{ text: label, style: 'badge', fillColor: color }]],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 2,
      paddingBottom: () => 2,
    },
  };
}

function formatStatus(status: InscriptionStatus): {
  label: string;
  color: string;
} {
  switch (status) {
    case 'PAID':
      return { label: 'Pago', color: '#2f855a' };
    case 'PENDING':
      return { label: 'Pendente', color: '#b7791f' };
    case 'UNDER_REVIEW':
      return { label: 'Em análise', color: '#2b6cb0' };
    case 'CANCELLED':
      return { label: 'Cancelado', color: '#9b2c2c' };
    case 'EXPIRED':
      return { label: 'Expirado', color: '#4a5568' };
    default:
      return { label: String(status), color: '#4a5568' };
  }
}

function formatAge(date?: Date | null): string {
  if (!date) return '-';

  const birthDate = new Date(date);
  if (Number.isNaN(birthDate.getTime())) return '-';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age < 0 ? '-' : String(age);
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('pt-BR');
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

function formatShirtSize(size?: ShirtSize | null): string {
  if (!size) return '-';
  return String(size);
}

function formatShirtType(type?: ShirtType | null): string {
  if (!type) return '-';
  return String(type);
}

function formatId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) {
    return 'ID: -';
  }
  const visiblePart = trimmed.slice(0, 8);
  return `ID: ${visiblePart}${trimmed.length > 8 ? '...' : ''}`;
}
