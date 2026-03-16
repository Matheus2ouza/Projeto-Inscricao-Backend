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

export type GuestExpiredCleanupPdfInscription = {
  id: string;
  guestName?: string;
  responsible: string;
  createdAt: Date;
};

export type GuestExpiredCleanupPdfEvent = {
  name?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
};

export type GuestExpiredCleanupPdfData = {
  header: PdfHeaderDefinition;
  event: GuestExpiredCleanupPdfEvent;
  totalDeleted: number;
  inscriptions: GuestExpiredCleanupPdfInscription[];
};

export class GuestExpiredCleanupPdfGeneratorUtils {
  public static generateGuestExpiredCleanupPdf(
    data: GuestExpiredCleanupPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection(data.header);

    const summarySection = [
      {
        text: 'RESUMO DA LIMPEZA DE INSCRIÇÕES GUEST EXPIRADAS',
        style: 'sectionTitle',
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          {
            width: '60%',
            stack: [
              {
                text: 'Evento:',
                style: 'labelText',
                margin: [0, 0, 0, 2],
              },
              {
                text: data.event.name || '-',
                style: 'valueText',
                margin: [0, 0, 0, 8],
              },
            ],
          },
          {
            width: '40%',
            stack: [
              {
                text: 'Período do evento:',
                style: 'labelText',
                margin: [0, 0, 0, 2],
              },
              {
                text: this.buildEventPeriod(data.event),
                style: 'valueText',
                margin: [0, 0, 0, 8],
              },
            ],
          },
        ],
      },
      {
        columns: [
          {
            width: '100%',
            stack: [
              {
                text: 'Total de inscrições guest removidas:',
                style: 'labelText',
                margin: [0, 0, 0, 2],
              },
              {
                text: `${data.totalDeleted}`,
                style: 'valueText',
                margin: [0, 0, 0, 8],
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

    const tableBody = [
      [
        { text: '#', style: 'tableHeader', alignment: 'center' },
        { text: 'ID da inscrição', style: 'tableHeader', alignment: 'left' },
        { text: 'Nome do convidado', style: 'tableHeader', alignment: 'left' },
        {
          text: 'Responsável',
          style: 'tableHeader',
          alignment: 'left',
        },
        {
          text: 'Data de criação',
          style: 'tableHeader',
          alignment: 'center',
        },
      ],
      ...this.buildInscriptionRows(data.inscriptions),
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
        ...summarySection,
        {
          text: `INSCRIÇÕES GUEST REMOVIDAS - ${data.inscriptions.length} registros`,
          style: 'sectionTitle',
          margin: [0, 12, 0, 8],
        },
        {
          table: {
            headerRows: 1,
            widths: ['6%', '24%', '30%', '20%', '20%'],
            body: tableBody,
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
          fontSize: 10,
          bold: true,
          fillColor: '#e2e8f0',
          color: '#1a202c',
        },
        tableRow: {
          fontSize: 9,
          color: '#1a202c',
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

  private static buildEventPeriod(
    event: GuestExpiredCleanupPdfEvent,
  ): string {
    const start = event.startDate ? formatDate(event.startDate) : undefined;
    const end = event.endDate ? formatDate(event.endDate) : undefined;

    if (start && end) {
      return `${start} até ${end}`;
    }

    return start ?? end ?? '-';
  }

  private static buildInscriptionRows(
    inscriptions: GuestExpiredCleanupPdfInscription[],
  ) {
    if (!inscriptions.length) {
      return [
        [
          {
            text: 'Nenhuma inscrição guest foi removida neste período.',
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

    return inscriptions.map((inscription, index) => [
      {
        text: (index + 1).toString(),
        alignment: 'center',
        style: 'tableRow',
      },
      { text: inscription.id, style: 'tableRow' },
      { text: inscription.guestName || '-', style: 'tableRow' },
      { text: inscription.responsible, style: 'tableRow' },
      {
        text: formatDateTime(inscription.createdAt),
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

