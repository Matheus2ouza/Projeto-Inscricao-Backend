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

export type TicketUnitCard = {
  ticketUnitId: string;
  ticketName: string;
  qrCode: string;
};

export type TicketUnitPdfSaleInfo = {
  saleId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  totalTickets: number;
  totalValue?: number;
};

export type TicketUnitsPdfData = {
  header: PdfHeaderDefinition;
  saleInfo: TicketUnitPdfSaleInfo;
  tickets: TicketUnitCard[];
};

export class TicketUnitsPdfGenerator {
  public static generateTicketUnitsPdf(
    data: TicketUnitsPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection(data.header);
    const generatedAt = new Date();

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        lineHeight: 1.25,
      },
      content: [
        ...headerContent,
        this.buildSaleSummarySection(data.saleInfo),
        ...this.buildInformationSection(),
        ...this.buildTicketGroups(data.tickets),
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
        summaryLabel: {
          fontSize: 10,
          bold: true,
          color: '#4a5568',
          margin: [0, 4, 0, 2],
        },
        summaryValue: {
          fontSize: 11,
          color: '#1a202c',
        },
        sectionTitle: {
          fontSize: 15,
          bold: true,
          color: '#1a202c',
        },
        ticketGroupTitle: {
          fontSize: 13,
          bold: true,
          color: '#1f2937',
        },
        ticketName: {
          fontSize: 11,
          bold: true,
          color: '#2d3748',
          alignment: 'center',
        },
        footer: {
          fontSize: 9,
          color: '#4a5568',
        },
        infoText: {
          fontSize: 10,
          color: '#1f2937',
          lineHeight: 1.4,
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

  private static buildInformationSection() {
    const infoItems = [
      'Apresente o QR Code impresso ou em um dispositivo eletrônico.',
      'Cada ticket é de uso unico, valido somente durante a Conferência.',
      'Em caso de perca do ticket, entre em contato com a administração.',
    ];

    return [
      {
        text: 'INFORMAÇÕES',
        style: 'sectionTitle',
        margin: [0, 12, 0, 6],
      },
      {
        ul: infoItems,
        style: 'infoText',
        margin: [12, 0, 0, 12],
      },
    ];
  }

  private static buildSaleSummarySection(saleInfo: TicketUnitPdfSaleInfo) {
    const buyerColumns = [
      {
        text: 'Comprador',
        style: 'summaryLabel',
        margin: [0, 0, 0, 1],
      },
      {
        text: 'Email',
        style: 'summaryLabel',
        margin: [0, 0, 0, 1],
      },
      {
        text: 'Telefone',
        style: 'summaryLabel',
        margin: [0, 0, 0, 1],
      },
      {
        text: saleInfo.buyerName,
        style: 'summaryValue',
        margin: [0, 6, 0, 0],
      },
      {
        text: saleInfo.buyerEmail,
        style: 'summaryValue',
        margin: [0, 6, 0, 0],
      },
      {
        text: saleInfo.buyerPhone || '-',
        style: 'summaryValue',
        margin: [0, 6, 0, 0],
      },
    ];

    const statsColumns = [
      {
        text: 'Total de tickets',
        style: 'summaryLabel',
        margin: [0, 0, 0, 1],
      },
      {
        text: 'Valor total',
        style: 'summaryLabel',
        margin: [0, 0, 0, 1],
      },
      {
        text: saleInfo.totalTickets.toString(),
        style: 'summaryValue',
        margin: [0, 6, 0, 0],
      },
      {
        text: saleInfo.totalValue
          ? `R$ ${saleInfo.totalValue.toFixed(2)}`
          : ' - ',
        style: 'summaryValue',
        margin: [0, 6, 0, 0],
      },
    ];

    return {
      stack: [
        {
          table: {
            widths: ['28%', '44%', '28%'],
            body: [buyerColumns.slice(0, 3), buyerColumns.slice(3, 6)],
          },
          layout: {
            defaultBorder: false,
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 24,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },
          margin: [0, 0, 0, 12],
        },
        {
          table: {
            widths: ['50%', '50%'],
            body: [statsColumns.slice(0, 2), statsColumns.slice(2, 4)],
          },
          layout: {
            defaultBorder: false,
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 32,
            paddingTop: () => 2,
            paddingBottom: () => 2,
          },
        },
      ],
    };
  }

  private static buildTicketGroups(tickets: TicketUnitCard[]) {
    if (!tickets.length) {
      return [
        {
          text: 'Nenhum ticket foi gerado para esta venda.',
          style: 'summaryValue',
        },
      ];
    }

    const groupedTickets = new Map<string, TicketUnitCard[]>();
    tickets.forEach((ticket) => {
      const group = groupedTickets.get(ticket.ticketName) ?? [];
      group.push(ticket);
      groupedTickets.set(ticket.ticketName, group);
    });

    const sections: any[] = [];
    let isFirst = true;

    for (const [ticketName, groupTickets] of groupedTickets.entries()) {
      sections.push({
        text: ticketName.toUpperCase(),
        style: 'ticketGroupTitle',
        margin: [0, isFirst ? 12 : 24, 0, 8],
        pageBreak: isFirst ? undefined : 'before',
      });
      sections.push(...this.buildTicketsPages(groupTickets));
      isFirst = false;
    }

    return sections;
  }

  private static buildTicketsPages(tickets: TicketUnitCard[]) {
    const perRow = 3;
    const rows: TicketUnitCard[][] = [];
    for (let i = 0; i < tickets.length; i += perRow) {
      rows.push(tickets.slice(i, i + perRow));
    }

    return rows.map((row, index) => ({
      columns: [
        ...row.map((ticket) => this.buildTicketCard(ticket)),
        ...Array.from({ length: perRow - row.length }).map(() => ({
          width: '*',
          text: '',
        })),
      ],
      columnGap: 16,
      margin: [0, 0, 0, 16],
      pageBreak: index === rows.length - 1 ? undefined : undefined,
    }));
  }

  private static buildTicketCard(ticket: TicketUnitCard) {
    return {
      width: '*',
      table: {
        widths: ['*'],
        body: [
          [
            {
              stack: [
                { qr: ticket.qrCode, fit: 140, alignment: 'center' },
                {
                  text: ticket.ticketName.toUpperCase(),
                  style: 'ticketName',
                  margin: [0, 10, 0, 2],
                },
              ],
              margin: [12, 12, 12, 12],
            },
          ],
        ],
      },
      layout: {
        hLineWidth: (index: number) => (index === 0 || index === 1 ? 1 : 0),
        vLineWidth: (index: number) => (index === 0 || index === 1 ? 1 : 0),
        hLineColor: () => '#E2E8F0',
        vLineColor: () => '#E2E8F0',
        paddingLeft: () => 0,
        paddingRight: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
      },
    };
  }
}

function formatDateTime(date: Date): string {
  const formatter = new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Sao_Paulo',
  });
  return formatter.format(date);
}
