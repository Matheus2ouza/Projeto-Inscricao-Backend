import {
  genderType,
  InscriptionStatus,
  PaymentMethod,
  ShirtSize,
  ShirtType,
  StatusPayment,
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
  email?: string;
  phone?: string;
  locality: string;
  status: InscriptionStatus;
  createdAt: Date;
  isGuest?: boolean;
  participants?: ListInscriptionsPdfParticipant[];
  payment?: {
    methodPayment: PaymentMethod;
    guestName?: string;
    status: StatusPayment;
    totalPaid: number;
    totalReceived: number;
    createdAt: Date;
    receiptPath?: string;
    installments?: {
      installmentNumber: number;
      received: boolean;
      value: number;
      netValue: number;
      paidAt: Date;
    }[];
  };
};

export type ListInscriptionsPdfData = {
  header: PdfHeaderDefinition;
  inscriptions: ListInscriptionsPdfInscription[];
  totals?: {
    totalInscriptions?: number;
    totalAccountParticipants: number;
    totalGuestParticipants: number;
  };
  participantSummary?: {
    total: number;
    male: number;
    female: number;
  };
  paymentSummary?: {
    byMethod: Array<{
      method: PaymentMethod;
      totalValue: number;
      totalNetValue: number;
      totalReceived: number;
    }>;
  };
};

export class ListInscriptionsPdfGeneratorUtils {
  public static generateListInscriptionsPdf(
    data: ListInscriptionsPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection(data.header);

    const content = [
      ...headerContent,
      ...this.buildSummaryContent(data),
      ...this.buildInscriptionsContent(data.inscriptions),
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
        subsectionTitle: {
          fontSize: 12,
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

  private static buildSummaryContent(data: ListInscriptionsPdfData) {
    const { inscriptions, participantSummary, paymentSummary } = data;
    const total = inscriptions.length;
    const statusCounts = new Map<string, number>();
    const methodCounts = new Map<string, number>();

    for (const inscription of inscriptions) {
      const statusKey = formatStatus(inscription.status).label;
      statusCounts.set(statusKey, (statusCounts.get(statusKey) ?? 0) + 1);

      const methodKey = inscription.payment?.methodPayment
        ? formatPaymentMethod(inscription.payment.methodPayment).label
        : 'Sem pagamento';
      methodCounts.set(methodKey, (methodCounts.get(methodKey) ?? 0) + 1);
    }

    const statusRows = [...statusCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .map(([key, value]): [string, number] => [key, value]);

    const methodRows = [...methodCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
      .map(([key, value]): [string, number] => [key, value]);

    const content: any[] = [
      {
        text: 'Sumário',
        style: 'sectionTitle',
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Inscrições encontradas', style: 'labelText' },
              { text: String(total), style: 'valueText' },
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
        text: 'Por status',
        style: 'subsectionTitle',
        margin: [0, 0, 0, 6],
      },
      buildSummaryTable(statusRows),
      {
        text: 'Por método de pagamento',
        style: 'subsectionTitle',
        margin: [0, 10, 0, 6],
      },
      buildSummaryTable(methodRows),
    ];

    // Seção de Participantes (se os dados existirem)
    if (participantSummary) {
      content.push(
        {
          text: 'Participantes',
          style: 'subsectionTitle',
          margin: [0, 10, 0, 6],
        },
        {
          columns: [
            {
              width: '33%',
              stack: [
                { text: 'Total', style: 'labelText' },
                { text: String(participantSummary.total), style: 'valueText' },
              ],
            },
            {
              width: '33%',
              stack: [
                { text: 'Masculino', style: 'labelText' },
                { text: String(participantSummary.male), style: 'valueText' },
              ],
            },
            {
              width: '33%',
              stack: [
                { text: 'Feminino', style: 'labelText' },
                { text: String(participantSummary.female), style: 'valueText' },
              ],
            },
          ],
          margin: [0, 0, 0, 10],
        },
      );
    }

    // Seção de Resumo de Pagamentos (se os dados existirem)
    if (paymentSummary && paymentSummary.byMethod.length > 0) {
      content.push(
        {
          text: 'Resumo de Pagamentos',
          style: 'subsectionTitle',
          margin: [0, 10, 0, 6],
        },
        buildPaymentSummaryTable(paymentSummary.byMethod),
      );
    }

    // Linha separadora e quebra de página
    content.push({
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
      margin: [0, 14, 0, 0],
      pageBreak: 'after',
    });

    return content;
  }

  private static buildInscriptionsContent(
    inscriptions: ListInscriptionsPdfInscription[],
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

    const blocks = this.buildInscriptionBlocks(inscriptions);

    if (blocks.length > 0) {
      blocks[0] = {
        ...blocks[0],
        stack: [
          {
            text: `Inscrições (${inscriptions.length})`,
            style: 'sectionTitle',
            margin: [0, 0, 0, 12],
          },
          ...blocks[0].stack,
        ],
      };
    }

    return blocks;
  }

  private static buildInscriptionBlocks(
    inscriptions: ListInscriptionsPdfInscription[],
  ) {
    return inscriptions.map((inscription, index) => {
      const details = [
        {
          columns: [
            {
              width: '34%',
              stack: [
                { text: 'Responsável', style: 'labelText' },
                { text: inscription.responsible || '-', style: 'valueText' },
              ],
            },
            {
              width: '33%',
              stack: [
                { text: 'Email', style: 'labelText' },
                { text: inscription.email || '-', style: 'valueText' },
              ],
            },
            {
              width: '33%',
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
              width: '34%',
              stack: [
                { text: 'Telefone', style: 'labelText' },
                { text: inscription.phone || '-', style: 'valueText' },
              ],
            },
            {
              width: '33%',
              stack: [
                { text: 'Status', style: 'labelText' },
                buildStatusBadge(inscription.status),
              ],
            },
            {
              width: '33%',
              stack: [
                { text: 'Data da inscrição', style: 'labelText' },
                {
                  text: formatDateTime(inscription.createdAt),
                  style: 'valueText',
                },
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
              style: 'subsectionTitle',
              margin: [0, 6, 0, 4],
            },
            buildParticipantsTable(inscription.participants),
          ]
        : [];

      const paymentBlock = inscription.payment
        ? [
            {
              text: 'Pagamentos',
              style: 'subsectionTitle',
              margin: [0, 6, 0, 4],
            },
            {
              columns: [
                {
                  width: '34%',
                  stack: [
                    { text: 'Nome (pagamento)', style: 'labelText' },
                    {
                      text: inscription.payment.guestName || '-',
                      style: 'valueText',
                    },
                  ],
                },
                {
                  width: '33%',
                  stack: [
                    { text: 'Método', style: 'labelText' },
                    buildPaymentMethodBadge(inscription.payment.methodPayment),
                  ],
                },
                {
                  width: '33%',
                  stack: [
                    { text: 'Status do pagamento', style: 'labelText' },
                    buildPaymentStatusBadge(inscription.payment.status),
                  ],
                },
              ],
              margin: [0, 0, 0, 8],
            },
            {
              columns: [
                {
                  width: '34%',
                  stack: [
                    { text: 'Total pago', style: 'labelText' },
                    {
                      text: formatCurrency(inscription.payment.totalPaid),
                      style: 'valueText',
                    },
                  ],
                },
                {
                  width: '33%',
                  stack: [
                    { text: 'Total recebido', style: 'labelText' },
                    {
                      text: formatCurrency(inscription.payment.totalReceived),
                      style: 'valueText',
                    },
                  ],
                },
                {
                  width: '33%',
                  stack: [
                    { text: 'Criado em (pagamento)', style: 'labelText' },
                    {
                      text: formatDateTime(inscription.payment.createdAt),
                      style: 'valueText',
                    },
                  ],
                },
              ],
              margin: [0, 0, 0, 10],
            },
            {
              text: 'Parcelas',
              style: 'labelText',
              margin: [0, 6, 0, 4],
            },
            buildInstallmentsTable(inscription.payment.installments),
            ...(inscription.payment.methodPayment === PaymentMethod.PIX
              ? [
                  {
                    stack: [
                      { text: 'Diretório do comprovante', style: 'labelText' },
                      {
                        text: inscription.payment.receiptPath || '-',
                        style: 'valueText',
                      },
                    ],
                    margin: [0, 0, 0, 10],
                  },
                ]
              : []),
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
          ...paymentBlock,
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

// ========== Funções auxiliares (inalteradas, exceto pela nova função buildPaymentSummaryTable) ==========

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

function buildSummaryTable(rows: [string, number][]) {
  return {
    table: {
      headerRows: 1,
      widths: ['70%', '30%'],
      body: [
        [
          { text: 'Item', style: 'tableHeader' },
          { text: 'Qtd.', style: 'tableHeader', alignment: 'center' },
        ],
        ...(rows.length
          ? rows.map(([label, count]) => [
              { text: label || '-', style: 'tableRow' },
              { text: String(count), style: 'tableRow', alignment: 'center' },
            ])
          : [
              [
                {
                  text: 'Nenhum dado para exibir.',
                  style: 'tableRow',
                  italics: true,
                  colSpan: 2,
                  alignment: 'center',
                },
                {},
              ],
            ]),
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
    margin: [0, 0, 0, 0],
  };
}

function buildInstallmentsTable(
  installments?: {
    installmentNumber: number;
    received: boolean;
    value: number;
    netValue: number;
    paidAt: Date;
  }[],
) {
  const rows = installments?.length
    ? installments.map((item) => [
        {
          text: String(item.installmentNumber),
          style: 'tableRow',
          alignment: 'center',
        },
        {
          text: item.received ? 'Sim' : 'Não',
          style: 'tableRow',
          alignment: 'center',
        },
        { text: formatCurrency(item.value), style: 'tableRow' },
        { text: formatCurrency(item.netValue), style: 'tableRow' },
        { text: formatDateTime(item.paidAt), style: 'tableRow' },
      ])
    : [
        [
          {
            text: 'Nenhuma parcela encontrada para este pagamento.',
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

  return {
    table: {
      headerRows: 1,
      widths: ['12%', '14%', '24%', '24%', '26%'],
      body: [
        [
          { text: 'Parcela', style: 'tableHeader', alignment: 'center' },
          { text: 'Recebido', style: 'tableHeader', alignment: 'center' },
          { text: 'Valor', style: 'tableHeader' },
          { text: 'Valor líquido', style: 'tableHeader' },
          { text: 'Pago em', style: 'tableHeader' },
        ],
        ...rows,
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

function buildPaymentSummaryTable(
  byMethod: Array<{
    method: PaymentMethod;
    totalValue: number;
    totalNetValue: number;
    totalReceived: number;
  }>,
) {
  const rows = byMethod.map((item) => [
    { text: formatPaymentMethod(item.method).label, style: 'tableRow' },
    {
      text: formatCurrency(item.totalValue),
      style: 'tableRow',
      alignment: 'right',
    },
    {
      text: formatCurrency(item.totalNetValue),
      style: 'tableRow',
      alignment: 'right',
    },
    {
      text: formatCurrency(item.totalReceived),
      style: 'tableRow',
      alignment: 'right',
    },
  ]);

  return {
    table: {
      headerRows: 1,
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [
          { text: 'Método', style: 'tableHeader' },
          { text: 'Total Pago', style: 'tableHeader', alignment: 'right' },
          { text: 'Total Líquido', style: 'tableHeader', alignment: 'right' },
          { text: 'Total Recebido', style: 'tableHeader', alignment: 'right' },
        ],
        ...(rows.length
          ? rows
          : [
              [
                {
                  text: 'Nenhum dado de pagamento.',
                  style: 'tableRow',
                  italics: true,
                  colSpan: 4,
                  alignment: 'center',
                },
                {},
                {},
                {},
              ],
            ]),
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
    margin: [0, 0, 0, 10],
  };
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

function buildPaymentStatusBadge(status: StatusPayment): any {
  const { label, color } = formatPaymentStatus(status);

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

function buildPaymentMethodBadge(method: PaymentMethod): any {
  const { label, color } = formatPaymentMethod(method);

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

function formatPaymentMethod(method: PaymentMethod): {
  label: string;
  color: string;
} {
  switch (method) {
    case 'PIX':
      return { label: 'PIX', color: '#7c3aed' };
    case 'CARTAO':
      return { label: 'Cartão', color: '#c026d3' };
    case 'DINHEIRO':
      return { label: 'Dinheiro', color: '#0f766e' };
    default:
      return { label: String(method), color: '#6b7280' };
  }
}

function formatPaymentStatus(status: StatusPayment): {
  label: string;
  color: string;
} {
  switch (status) {
    case 'APPROVED':
      return { label: 'Aprovado', color: '#2f855a' };
    case 'UNDER_REVIEW':
      return { label: 'Em análise', color: '#2b6cb0' };
    case 'REFUSED':
      return { label: 'Recusado', color: '#9b2c2c' };
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

function formatCurrency(value?: number | null): string {
  if (value == null) return '-';
  const safe = Number(value);
  if (Number.isNaN(safe)) return '-';
  return safe.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
