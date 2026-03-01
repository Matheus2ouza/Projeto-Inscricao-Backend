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

const printer = new PdfPrinter(fonts);

type CashRegisterReportPdfData = {
  cashRegister: {
    id: string;
    name: string;
    status: string;
    balance: number;
    totalIncome: number;
    totalExpense: number;
    totalCash: number;
    totalCard: number;
    totalPix: number;
    openedAt: Date;
    closedAt?: Date;
  };
  moviments: {
    index: number;
    method: string;
    origin: string;
    value: number;
    createdAt: Date;
  }[];
};

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDateTime(date: Date) {
  const d = new Date(date);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}`;
}

function toPortugueseStatus(status: string) {
  if (status === 'OPEN') return 'Aberto';
  if (status === 'CLOSED') return 'Fechado';
  return status;
}

function toPortugueseOrigin(origin: string) {
  if (origin === 'ASAAS') return 'Asaas';
  if (origin === 'INTERNAL') return 'Interno';
  if (origin === 'ONSITE') return 'Inscrição Avulsa';
  if (origin === 'EXPENSE') return 'Despesa';
  if (origin === 'TICKET') return 'Alimentação';
  if (origin === 'TRANSFER') return 'Transferência';
  if (origin === 'MANUAL') return 'Manual';
  return origin;
}

function toPortugueseMethod(method: string) {
  if (method === 'DINHEIRO') return 'Dinheiro';
  if (method === 'PIX') return 'Pix';
  if (method === 'CARTAO') return 'Cartão';
  return method;
}

export class CashRegisterReportPdfGeneratorUtils {
  public static generateReportPdf(
    data: CashRegisterReportPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection({
      title: `Relatório do Caixa: ${data.cashRegister.name}`,
    });

    const summaryTable = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Status', style: 'label' },
            {
              text: toPortugueseStatus(String(data.cashRegister.status)),
              style: 'value',
            },
          ],
          [
            { text: 'Saldo', style: 'label' },
            { text: formatCurrency(data.cashRegister.balance), style: 'value' },
          ],
          [
            { text: 'Total Entradas', style: 'label' },
            {
              text: formatCurrency(data.cashRegister.totalIncome),
              style: 'value',
            },
          ],
          [
            { text: 'Total Saídas', style: 'label' },
            {
              text: formatCurrency(data.cashRegister.totalExpense),
              style: 'value',
            },
          ],
          [
            { text: 'Total Dinheiro', style: 'label' },
            { text: formatCurrency(data.cashRegister.totalCash), style: 'value' },
          ],
          [
            { text: 'Total Cartão', style: 'label' },
            { text: formatCurrency(data.cashRegister.totalCard), style: 'value' },
          ],
          [
            { text: 'Total Pix', style: 'label' },
            { text: formatCurrency(data.cashRegister.totalPix), style: 'value' },
          ],
          [
            { text: 'Abertura', style: 'label' },
            {
              text: formatDateTime(data.cashRegister.openedAt),
              style: 'value',
            },
          ],
          [
            { text: 'Fechamento', style: 'label' },
            {
              text: data.cashRegister.closedAt
                ? formatDateTime(data.cashRegister.closedAt)
                : '-',
              style: 'value',
            },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 16],
    };

    const movimentsBody = [
      [
        { text: '#', style: 'tableHeader' },
        { text: 'Método', style: 'tableHeader' },
        { text: 'Origem', style: 'tableHeader' },
        { text: 'Valor', style: 'tableHeader' },
        { text: 'Data', style: 'tableHeader' },
      ],
      ...data.moviments.map((m) => [
        { text: String(m.index), style: 'tableCell' },
        { text: toPortugueseMethod(String(m.method)), style: 'tableCell' },
        { text: toPortugueseOrigin(String(m.origin)), style: 'tableCell' },
        {
          text: formatCurrency(m.value),
          style: 'tableCell',
          alignment: 'right',
        },
        { text: formatDateTime(m.createdAt), style: 'tableCell' },
      ]),
    ];

    const movimentsTable = {
      table: {
        headerRows: 1,
        widths: [24, 90, 120, 80, 120],
        body: movimentsBody,
      },
      layout: 'lightHorizontalLines',
      alignment: 'center',
    };

    const docDefinition: any = {
      pageMargins: [32, 32, 32, 32],
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        color: '#222222',
      },
      content: [
        ...headerContent,
        summaryTable,
        { text: 'Movimentações', style: 'sectionTitle', margin: [0, 8, 0, 8] },
        movimentsTable,
      ],
      styles: {
        headerTitle: { fontSize: 18, bold: true, color: '#1b1f23' },
        headerSubtitle: { fontSize: 12, bold: true },
        sectionTitle: { fontSize: 12, bold: true },
        label: { bold: true, color: '#333333' },
        value: { color: '#111111' },
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
