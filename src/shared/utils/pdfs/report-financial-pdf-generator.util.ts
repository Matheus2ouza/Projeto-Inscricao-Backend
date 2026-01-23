import path from 'path';
import PdfPrinter from 'pdfmake';
import { buildPdfHeaderSection } from './common/pdf-header.util';

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

type ReportFinancialPdfGeneratorOptions = {
  eventImageDataUrl?: string;
};

const printer = new PdfPrinter(fonts);

export class ReportFinancialPdfGeneratorUtils {
  public static generateReportPdf(
    data: any,
    options: ReportFinancialPdfGeneratorOptions = {},
  ): Promise<Buffer> {
    const headerColumns = options.eventImageDataUrl
      ? [
          {
            width: 100,
            image: options.eventImageDataUrl,
            fit: [100, 70],
            alignment: 'left',
          },
          {
            width: '*',
            text: data.event.name
              ? `RELATÓRIO FINANCEIRO: ${String(data.event.name).toUpperCase()}`
              : 'RELATÓRIO FINANCEIRO',
            style: 'eventTitle',
            fontSize: 22,
            bold: true,
            alignment: 'left',
          },
        ]
      : [
          {
            width: '*',
            text: data.event.name
              ? `RELATÓRIO FINANCEIRO: ${String(data.event.name).toUpperCase()}`
              : 'RELATÓRIO FINANCEIRO',
            style: 'eventTitle',
            fontSize: 22,
            bold: true,
            alignment: 'left',
          },
        ];

    const totalsTable = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Total Geral', style: 'sectionTitle' },
            {
              text: formatCurrency(data.totais.totalGeral),
              style: 'valueMain',
            },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            { text: formatCurrency(data.totais.totalDinheiro), style: 'value' },
          ],
          [
            { text: 'Cartão', style: 'label' },
            { text: formatCurrency(data.totais.totalCartao), style: 'value' },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.totais.totalPix), style: 'value' },
          ],
          [
            { text: 'Gastos', style: 'label' },
            { text: formatCurrency(data.totais.totalGastos), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 20],
    };

    const inscricoesTotals = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Total', style: 'sectionTitle' },
            { text: formatCurrency(data.inscricoes.total), style: 'valueMain' },
          ],
          [
            { text: 'Participantes', style: 'label' },
            { text: `${data.inscricoes.totalParticipantes}`, style: 'value' },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            {
              text: formatCurrency(data.inscricoes.totalDinheiro),
              style: 'value',
            },
          ],
          [
            { text: 'Cartão', style: 'label' },
            {
              text: formatCurrency(data.inscricoes.totalCartao),
              style: 'value',
            },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.inscricoes.totalPix), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };

    const inscricoesDetails =
      Array.isArray(data.inscricoes.inscricoes) &&
      data.inscricoes.inscricoes.length > 0
        ? {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Inscrição', style: 'tableHeader' },
                  { text: 'Criado em', style: 'tableHeader' },
                  { text: 'Total Pago', style: 'tableHeader' },
                  { text: 'Dinheiro', style: 'tableHeader' },
                  { text: 'Cartão', style: 'tableHeader' },
                ],
                ...data.inscricoes.inscricoes.map((i: any) => [
                  { text: i.id, style: 'cell' },
                  { text: formatDate(i.createdAt), style: 'cell' },
                  { text: formatCurrency(i.totalPaid), style: 'cell' },
                  { text: formatCurrency(i.paidCash), style: 'cell' },
                  { text: formatCurrency(i.paidCard), style: 'cell' },
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20],
          }
        : undefined;

    const avulsTotals = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Total', style: 'sectionTitle' },
            {
              text: formatCurrency(data.inscricoesAvulsas.total),
              style: 'valueMain',
            },
          ],
          [
            { text: 'Participantes', style: 'label' },
            {
              text: `${data.inscricoesAvulsas.totalParticipantes}`,
              style: 'value',
            },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            {
              text: formatCurrency(data.inscricoesAvulsas.totalDinheiro),
              style: 'value',
            },
          ],
          [
            { text: 'Cartão', style: 'label' },
            {
              text: formatCurrency(data.inscricoesAvulsas.totalCartao),
              style: 'value',
            },
          ],
          [
            { text: 'Pix', style: 'label' },
            {
              text: formatCurrency(data.inscricoesAvulsas.totalPix),
              style: 'value',
            },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };

    const avulsDetails =
      Array.isArray(data.inscricoesAvulsas.inscricoes) &&
      data.inscricoesAvulsas.inscricoes.length > 0
        ? {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Registro', style: 'tableHeader' },
                  { text: 'Criado em', style: 'tableHeader' },
                  { text: 'Total Pago', style: 'tableHeader' },
                  { text: 'Dinheiro', style: 'tableHeader' },
                  { text: 'Pix', style: 'tableHeader' },
                ],
                ...data.inscricoesAvulsas.inscricoes.map((r: any) => [
                  { text: r.id, style: 'cell' },
                  { text: formatDate(r.createdAt), style: 'cell' },
                  { text: formatCurrency(r.totalPaid), style: 'cell' },
                  { text: formatCurrency(r.paidCash), style: 'cell' },
                  { text: formatCurrency(r.paidPix), style: 'cell' },
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20],
          }
        : undefined;
    const ticketsTotals = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Total', style: 'sectionTitle' },
            {
              text: formatCurrency(data.ticketsSale.totalGeral),
              style: 'valueMain',
            },
          ],
          [
            { text: 'Tickets vendidos', style: 'label' },
            { text: `${data.ticketsSale.countTickets ?? 0}`, style: 'value' },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            {
              text: formatCurrency(data.ticketsSale.totalCash),
              style: 'value',
            },
          ],
          [
            { text: 'Cartão', style: 'label' },
            {
              text: formatCurrency(data.ticketsSale.totalCard),
              style: 'value',
            },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.ticketsSale.totalPix), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };

    const expensesTotals = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Total', style: 'sectionTitle' },
            { text: formatCurrency(data.gastos.total), style: 'valueMain' },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            { text: formatCurrency(data.gastos.totalDinheiro), style: 'value' },
          ],
          [
            { text: 'Cartão', style: 'label' },
            { text: formatCurrency(data.gastos.totalCartao), style: 'value' },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.gastos.totalPix), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };

    const expensesDetails =
      Array.isArray(data.gastos.gastos) && data.gastos.gastos.length > 0
        ? {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: [
                [
                  { text: 'Despesa', style: 'tableHeader' },
                  { text: 'Criado em', style: 'tableHeader' },
                  { text: 'Total', style: 'tableHeader' },
                ],
                ...data.gastos.gastos.map((g: any) => [
                  { text: g.id, style: 'cell' },
                  { text: formatDate(g.createdAt), style: 'cell' },
                  { text: formatCurrency(g.totalSpent), style: 'cell' },
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
          }
        : undefined;

    const content = [
      { columns: headerColumns, columnGap: 16, margin: [0, 0, 0, 10] },
      {
        text: `Relatório financeiro sobre o evento "${data.event.name}", que ocorreu do dia ${new Date(data.event.startDate).toLocaleDateString('pt-BR')} ao dia ${new Date(data.event.endDate).toLocaleDateString('pt-BR')}.`,
        fontSize: 10,
        style: 'summaryText',
        margin: [0, 0, 0, 20],
      },
      { text: 'TOTAL GERAL', style: 'subheader', margin: [0, 0, 0, 8] },
      totalsTable,
      { text: 'INSCRIÇÃO', style: 'subheader', margin: [0, 10, 0, 8] },
      inscricoesTotals,
      ...(inscricoesDetails ? [inscricoesDetails] : []),
      { text: 'INSCRIÇÕES AVULSAS', style: 'subheader', margin: [0, 10, 0, 8] },
      avulsTotals,
      ...(avulsDetails ? [avulsDetails] : []),
      { text: 'TICKETS', style: 'subheader', margin: [0, 10, 0, 8] },
      ticketsTotals,
      {
        unbreakable: true,
        stack: [
          { text: 'GASTOS', style: 'subheader', margin: [0, 10, 0, 8] },
          expensesTotals,
          ...(expensesDetails ? [expensesDetails] : []),
        ],
      },
    ];

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        lineHeight: 1.2,
      },
      content,
      styles: {
        eventTitle: {
          fontSize: 24,
          color: '#1a365d',
          bold: true,
          margin: [0, 0, 0, 5],
        },
        subheader: {
          fontSize: 14,
          color: '#2d3748',
          margin: [0, 15, 0, 8],
          bold: true,
          border: [false, false, false, true],
          borderColor: '#e2e8f0',
          borderWidth: 3,
          padding: [8, 0, 8, 0],
        },
        sectionTitle: { fontSize: 12, bold: true },
        label: { fontSize: 10, color: '#2d3748' },
        value: { fontSize: 10, bold: true },
        valueMain: { fontSize: 12, bold: true },
        tableHeader: {
          fontSize: 10,
          bold: true,
          color: '#ffffff',
          fillColor: '#2d3748',
          alignment: 'center',
        },
        cell: { fontSize: 10 },
        muted: { fontSize: 10, color: '#4a5568' },
        summaryText: { fontSize: 12, color: '#2d3748', alignment: 'center' },
        footer: { fontSize: 9, color: '#718096', alignment: 'center' },
      },
    };

    return new Promise((resolve) => {
      const doc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.end();
    });
  }

  public static generateReportPdfDetailed(
    data: any,
    options: ReportFinancialPdfGeneratorOptions = {},
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection({
      title: data.event?.name
        ? `Relatório Financeiro: ${data.event.name}`
        : 'Relatório Financeiro',
      titleDetail: `${formatDate(data.event.startDate)} até ${formatDate(
        data.event.endDate,
      )}`,
      image: options.eventImageDataUrl,
    });

    const sectionTitle = (text: string) => ({
      text,
      style: 'sectionTitle',
      margin: [0, 10, 0, 8],
    });

    const buildInscricoesTotals = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Inscrições', style: 'sectionTitle' },
            { text: formatCurrency(data.inscricoes.total), style: 'valueMain' },
          ],
          [
            { text: 'Participantes', style: 'label' },
            { text: `${data.inscricoes.totalParticipantes}`, style: 'value' },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            {
              text: formatCurrency(data.inscricoes.totalDinheiro),
              style: 'value',
            },
          ],
          [
            { text: 'Cartão', style: 'label' },
            {
              text: formatCurrency(data.inscricoes.totalCartao),
              style: 'value',
            },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.inscricoes.totalPix), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };

    const inscricoesDetails =
      Array.isArray(data.inscricoes.inscricoes) &&
      data.inscricoes.inscricoes.length > 0
        ? {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Inscrição', style: 'tableHeader' },
                  { text: 'Criado em', style: 'tableHeader' },
                  { text: 'Total Pago', style: 'tableHeader' },
                  { text: 'Dinheiro', style: 'tableHeader' },
                  { text: 'Cartão', style: 'tableHeader' },
                ],
                ...data.inscricoes.inscricoes.map((i: any) => [
                  { text: i.id, style: 'cell' },
                  { text: formatDate(i.createdAt), style: 'cell' },
                  { text: formatCurrency(i.totalPaid), style: 'cell' },
                  { text: formatCurrency(i.paidCash), style: 'cell' },
                  { text: formatCurrency(i.paidCard), style: 'cell' },
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20],
          }
        : undefined;

    const buildAvulsTotals = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Inscrições Avulsas', style: 'sectionTitle' },
            {
              text: formatCurrency(data.inscricoesAvulsas.total),
              style: 'valueMain',
            },
          ],
          [
            { text: 'Participantes', style: 'label' },
            {
              text: `${data.inscricoesAvulsas.totalParticipantes}`,
              style: 'value',
            },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            {
              text: formatCurrency(data.inscricoesAvulsas.totalDinheiro),
              style: 'value',
            },
          ],
          [
            { text: 'Cartão', style: 'label' },
            {
              text: formatCurrency(data.inscricoesAvulsas.totalCartao),
              style: 'value',
            },
          ],
          [
            { text: 'Pix', style: 'label' },
            {
              text: formatCurrency(data.inscricoesAvulsas.totalPix),
              style: 'value',
            },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };

    const avulsDetails =
      Array.isArray(data.inscricoesAvulsas.inscricoes) &&
      data.inscricoesAvulsas.inscricoes.length > 0
        ? {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Registro', style: 'tableHeader' },
                  { text: 'Criado em', style: 'tableHeader' },
                  { text: 'Total Pago', style: 'tableHeader' },
                  { text: 'Dinheiro', style: 'tableHeader' },
                  { text: 'Pix', style: 'tableHeader' },
                ],
                ...data.inscricoesAvulsas.inscricoes.map((r: any) => [
                  { text: r.id, style: 'cell' },
                  { text: formatDate(r.createdAt), style: 'cell' },
                  { text: formatCurrency(r.totalPaid), style: 'cell' },
                  { text: formatCurrency(r.paidCash), style: 'cell' },
                  { text: formatCurrency(r.paidPix), style: 'cell' },
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20],
          }
        : undefined;
    const ticketsTotalsDetailed = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Total', style: 'sectionTitle' },
            {
              text: formatCurrency(data.ticketsSale.totalGeral),
              style: 'valueMain',
            },
          ],
          [
            { text: 'Tickets vendidos', style: 'label' },
            { text: `${data.ticketsSale.countTickets ?? 0}`, style: 'value' },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            {
              text: formatCurrency(data.ticketsSale.totalCash),
              style: 'value',
            },
          ],
          [
            { text: 'Cartão', style: 'label' },
            {
              text: formatCurrency(data.ticketsSale.totalCard),
              style: 'value',
            },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.ticketsSale.totalPix), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };
    const ticketsDetails =
      Array.isArray(data.ticketsSale.details) &&
      data.ticketsSale.details.length > 0
        ? {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Ticket', style: 'tableHeader' },
                  { text: 'Quantidade', style: 'tableHeader' },
                  { text: 'Preço unit.', style: 'tableHeader' },
                  { text: 'Dinheiro', style: 'tableHeader' },
                  { text: 'Cartão', style: 'tableHeader' },
                  { text: 'Pix', style: 'tableHeader' },
                ],
                ...data.ticketsSale.details.map((d: any) => [
                  { text: d.name, style: 'cell' },
                  { text: `${d.quantity}`, style: 'cell' },
                  { text: formatCurrency(d.pricePerTicket), style: 'cell' },
                  { text: formatCurrency(d.totalCash), style: 'cell' },
                  { text: formatCurrency(d.totalCard), style: 'cell' },
                  { text: formatCurrency(d.totalPix), style: 'cell' },
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20],
          }
        : undefined;

    const buildGastosTotals = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Gastos', style: 'sectionTitle' },
            { text: formatCurrency(data.gastos.total), style: 'valueMain' },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            { text: formatCurrency(data.gastos.totalDinheiro), style: 'value' },
          ],
          [
            { text: 'Cartão', style: 'label' },
            { text: formatCurrency(data.gastos.totalCartao), style: 'value' },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.gastos.totalPix), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };

    const gastosDetails =
      Array.isArray(data.gastos.gastos) && data.gastos.gastos.length > 0
        ? {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto'],
              body: [
                [
                  { text: 'Despesa', style: 'tableHeader' },
                  { text: 'Criado em', style: 'tableHeader' },
                  { text: 'Total', style: 'tableHeader' },
                ],
                ...data.gastos.gastos.map((g: any) => [
                  { text: g.id, style: 'cell' },
                  { text: formatDate(g.createdAt), style: 'cell' },
                  { text: formatCurrency(g.totalSpent), style: 'cell' },
                ]),
              ],
            },
            layout: 'lightHorizontalLines',
          }
        : undefined;

    const totalsTableDetailed = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Totais', style: 'sectionTitle' },
            {
              text: formatCurrency(data.totais.totalGeral),
              style: 'valueMain',
            },
          ],
          [
            { text: 'Dinheiro', style: 'label' },
            { text: formatCurrency(data.totais.totalDinheiro), style: 'value' },
          ],
          [
            { text: 'Cartão', style: 'label' },
            { text: formatCurrency(data.totais.totalCartao), style: 'value' },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.totais.totalPix), style: 'value' },
          ],
          [
            { text: 'Gastos', style: 'label' },
            { text: formatCurrency(data.totais.totalGastos), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    };

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        lineHeight: 1.2,
      },
      content: [
        ...headerContent,
        {
          text: `Relatório financeiro sobre o evento "${data.event.name}", que ocorreu do dia ${new Date(data.event.startDate).toLocaleDateString('pt-BR')} ao dia ${new Date(data.event.endDate).toLocaleDateString('pt-BR')}.`,
          fontSize: 10,
          style: 'summaryText',
          margin: [0, 0, 0, 20],
        },
        sectionTitle('TOTAL GERAL'),
        totalsTableDetailed,
        sectionTitle('INSCRIÇÕES'),
        buildInscricoesTotals,
        ...(inscricoesDetails ? [inscricoesDetails] : []),
        { text: '', pageBreak: 'before' },
        sectionTitle('INSCRIÇÕES AVULSAS'),
        buildAvulsTotals,
        ...(avulsDetails ? [avulsDetails] : []),
        { text: '', pageBreak: 'before' },
        sectionTitle('TICKETS'),
        ticketsTotalsDetailed,
        ...(ticketsDetails ? [ticketsDetails] : []),
        { text: '', pageBreak: 'before' },
        sectionTitle('GASTOS'),
        buildGastosTotals,
        ...(gastosDetails ? [gastosDetails] : []),
      ],
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
        subheader: {
          fontSize: 14,
          color: '#2d3748',
          margin: [0, 15, 0, 8],
          bold: true,
          border: [false, false, false, true],
          borderColor: '#e2e8f0',
          borderWidth: 3,
          padding: [8, 0, 8, 0],
        },
        sectionTitle: { fontSize: 12, bold: true },
        label: { fontSize: 10, color: '#2d3748' },
        value: { fontSize: 10, bold: true },
        valueMain: { fontSize: 12, bold: true },
        tableHeader: {
          fontSize: 10,
          bold: true,
          fillColor: '#e2e8f0',
          color: '#1a202c',
        },
        cell: { fontSize: 10 },
        muted: { fontSize: 10, color: '#4a5568' },
        summaryText: { fontSize: 12, color: '#2d3748', alignment: 'center' },
        footer: { fontSize: 9, color: '#718096', alignment: 'center' },
      },
    };

    return new Promise((resolve) => {
      const doc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      doc.end();
    });
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(d);
}
