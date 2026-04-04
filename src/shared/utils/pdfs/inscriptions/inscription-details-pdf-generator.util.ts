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

export type InscriptionDetailsPdfParticipant = {
  title: string;
  name: string;
  cpf?: string;
  birthDate?: Date;
  age?: number;
  gender?: string;
  complementary: { label: string; value: string }[];
};

export type InscriptionDetailsPdfInstallment = {
  installmentNumber: number;
  received: boolean;
  value: string;
  netValue: string;
  paidAt?: Date;
  estimatedAt?: Date;
};

export type InscriptionDetailsPdfPayment = {
  title: string;
  id: string;
  status: string;
  method: string;
  createdAt?: Date;
  totals: { label: string; value: string }[];
  installments: InscriptionDetailsPdfInstallment[];
};

export type InscriptionDetailsPdfData = {
  eventName: string;
  inscription: {
    id: string;
    isGuest: boolean;
    responsibleName: string;
    guestEmail?: string;
    guestLocality?: string;
    phone?: string;
    email?: string;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
    totals: { label: string; value: string }[];
  };
  participants: InscriptionDetailsPdfParticipant[];
  payments: InscriptionDetailsPdfPayment[];
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDateTime(date: Date) {
  const d = new Date(date);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`;
}

function formatDate(date: Date) {
  const d = new Date(date);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function valueOrDash(value?: string) {
  const v = (value ?? '').trim();
  return v ? v : '-';
}

function kv(label: string, value?: string) {
  return {
    stack: [
      { text: label, style: 'kvLabel' },
      { text: valueOrDash(value), style: 'kvValue' },
    ],
  };
}

function kvRow(items: Array<{ label: string; value?: string }>) {
  return {
    columns: items.map((i) => kv(i.label, i.value)),
    columnGap: 18,
    margin: [0, 0, 0, 10],
  };
}

function kvGrid(
  items: Array<{ label: string; value?: string }>,
  columnsCount: number,
) {
  const rows: any[] = [];
  for (let i = 0; i < items.length; i += columnsCount) {
    rows.push(kvRow(items.slice(i, i + columnsCount)));
  }
  return rows;
}

function sectionHeader(text: string) {
  return [
    { text, style: 'sectionTitle', margin: [0, 14, 0, 6] },
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
      margin: [0, 0, 0, 10],
    },
  ];
}

export class InscriptionDetailsPdfGeneratorUtils {
  public static generatePdf(data: InscriptionDetailsPdfData): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection({
      title: data.eventName || 'Evento',
      subtitle: 'Detalhes da Inscrição',
    });

    const content: any[] = [
      ...headerContent,
      {
        text: `Gerado em ${formatDate(new Date())}`,
        style: 'muted',
        margin: [0, 0, 0, 8],
      },
      ...sectionHeader('Inscrição'),
      ...kvGrid([{ label: 'ID', value: data.inscription.id }], 1),
      ...kvGrid(
        [
          { label: 'Responsável', value: data.inscription.responsibleName },
          {
            label: 'Status',
            value: data.inscription.status,
          },
        ],
        2,
      ),
      ...kvGrid(
        [
          {
            label: 'Email',
            value: data.inscription.email ?? data.inscription.guestEmail,
          },
          { label: 'Telefone', value: data.inscription.phone },
        ],
        2,
      ),
      ...kvGrid(
        [
          { label: 'Localidade', value: data.inscription.guestLocality },
          {
            label: 'Criada em',
            value: data.inscription.createdAt
              ? formatDateTime(data.inscription.createdAt)
              : undefined,
          },
        ],
        2,
      ),
    ];

    content.push({ text: '', pageBreak: 'after' });
    content.push(...sectionHeader('Participantes'));

    if (data.participants.length === 0) {
      content.push({ text: 'Nenhum participante encontrado.', style: 'muted' });
    } else {
      for (const participant of data.participants) {
        content.push({
          text: participant.title,
          style: 'itemTitle',
          margin: [0, 6, 0, 8],
        });

        const participantRows: Array<{ label: string; value?: string }> = [
          { label: 'Nome', value: participant.name },
          { label: 'Gênero', value: participant.gender },
        ];

        if (participant.cpf) {
          participantRows.push({ label: 'CPF', value: participant.cpf });
        }

        if (participant.birthDate) {
          participantRows.push({
            label: 'Nascimento',
            value: formatDate(participant.birthDate),
          });
        }
        if (participant.age !== undefined) {
          participantRows.push({
            label: 'Idade',
            value: String(participant.age),
          });
        }

        content.push(...kvGrid(participantRows, 2));

        if (participant.complementary.length > 0) {
          content.push({
            text: 'Dados complementares',
            style: 'subtleTitle',
            margin: [0, 0, 0, 4],
          });

          content.push(...kvGrid(participant.complementary, 2));
        }

        content.push({
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 531,
              y2: 0,
              lineWidth: 1,
              lineColor: '#f3f4f6',
            },
          ],
          margin: [0, 6, 0, 0],
        });
      }
    }

    content.push({ text: '', pageBreak: 'after' });
    content.push(...sectionHeader('Pagamentos'));

    if (data.payments.length === 0) {
      content.push({ text: 'Nenhum pagamento encontrado.', style: 'muted' });
    } else {
      for (const payment of data.payments) {
        content.push({
          text: payment.title,
          style: 'itemTitle',
          margin: [0, 6, 0, 8],
        });

        content.push({
          text: 'Dados complementares',
          style: 'subtleTitle',
          margin: [0, 0, 0, 4],
        });

        content.push(
          ...kvGrid(
            [
              { label: 'ID', value: payment.id },
              { label: 'Status', value: payment.status },
              { label: 'Método', value: payment.method },
              {
                label: 'Criado em',
                value: payment.createdAt
                  ? formatDateTime(payment.createdAt)
                  : undefined,
              },
            ],
            2,
          ),
        );

        if (payment.totals.length > 0) {
          content.push({
            text: 'Valores do pagamento',
            style: 'subtleTitle',
            margin: [0, 0, 0, 4],
          });
          content.push(...kvGrid(payment.totals, 2));
        }

        if (payment.installments.length > 0) {
          const tableHeaderRow = [
            { text: 'Parcela', style: 'tableHeader', alignment: 'center' },
            { text: 'Recebida', style: 'tableHeader', alignment: 'center' },
            { text: 'Valor', style: 'tableHeader', alignment: 'right' },
            { text: 'Líquido', style: 'tableHeader', alignment: 'right' },
            { text: 'Pago em', style: 'tableHeader' },
            { text: 'Prevista em', style: 'tableHeader' },
          ];

          const tableBody = [
            tableHeaderRow,
            ...payment.installments
              .slice()
              .sort((a, b) => a.installmentNumber - b.installmentNumber)
              .map((i) => {
                const paidAtText = i.paidAt ? formatDateTime(i.paidAt) : '-';
                const estimatedAtText = i.estimatedAt
                  ? formatDateTime(i.estimatedAt)
                  : '-';

                const row = [
                  {
                    text: String(i.installmentNumber),
                    style: 'tableCell',
                    alignment: 'center',
                  },
                  {
                    text: i.received ? 'Sim' : 'Não',
                    style: 'tableCell',
                    alignment: 'center',
                  },
                  { text: i.value, style: 'tableCell', alignment: 'right' },
                  { text: i.netValue, style: 'tableCell', alignment: 'right' },
                  { text: paidAtText, style: 'tableCell' },
                  { text: estimatedAtText, style: 'tableCell' },
                ];

                return row;
              }),
          ];

          content.push({
            text: 'Parcelas',
            style: 'subtleTitle',
            margin: [0, 0, 0, 6],
          });

          content.push({
            table: {
              headerRows: 1,
              widths: [48, 60, 70, 70, '*', '*'],
              body: tableBody,
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 8],
          });
        }

        content.push({
          canvas: [
            {
              type: 'line',
              x1: 0,
              y1: 0,
              x2: 531,
              y2: 0,
              lineWidth: 1,
              lineColor: '#f3f4f6',
            },
          ],
          margin: [0, 6, 0, 0],
        });
      }
    }

    const docDefinition: any = {
      pageMargins: [32, 32, 32, 32],
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        color: '#1f2937',
      },
      content,
      styles: {
        headerTitle: { fontSize: 18, bold: true, color: '#111827' },
        headerTitleDetail: { fontSize: 11, color: '#6b7280' },
        headerSubtitle: { fontSize: 12, bold: true, color: '#111827' },
        sectionTitle: { fontSize: 11, bold: true, color: '#111827' },
        kvLabel: { fontSize: 9, color: '#6b7280' },
        kvValue: { fontSize: 10, bold: true, color: '#111827' },
        itemTitle: { fontSize: 11, bold: true, color: '#111827' },
        subtleTitle: { fontSize: 10, bold: true, color: '#374151' },
        muted: { fontSize: 9, color: '#6b7280' },
        tableHeader: { bold: true, fillColor: '#f3f4f6', margin: [0, 4, 0, 4] },
        tableCell: { margin: [0, 3, 0, 3] },
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
