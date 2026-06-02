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
    initialBalance?: number;
    totalIncome: number;
    totalExpense: number;
    totalCash: number;
    totalCard: number;
    totalPix: number;
    openedAt: Date;
    closedAt?: Date;
  };
  favoriteReport?: boolean;
  moviments: {
    index: number;
    type: string;
    method: string;
    origin: string;
    value: number;
    createdAt: Date;
    responsible?: string;
    description?: string;
    category?: string;
  }[];
  allMoviments?: {
    type: string;
    method: string;
    origin: string;
    value: number;
    createdAt: Date;
    responsible?: string;
    description?: string;
    category?: string;
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

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  });
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
  });
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

function toPortugueseCategory(category: string) {
  return String(category)
    .toLowerCase()
    .split('_')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export class CashRegisterReportPdfGeneratorUtils {
  public static generateReportPdf(
    data: CashRegisterReportPdfData,
  ): Promise<Buffer> {
    const generatedAt = new Date();
    const headerContent = buildPdfHeaderSection({
      title: `Relatório do Caixa: ${data.cashRegister.name}`,
    });
    headerContent[0].margin = [0, 0, 0, 6];

    const periodEnd = data.cashRegister.closedAt ?? generatedAt;
    const periodText = `Periodo: ${formatDateTime(data.cashRegister.openedAt)} - ${formatDateTime(
      periodEnd,
    )}`;

    // Use allMoviments for calculations if favoriteReport is true, otherwise use regular moviments
    const movimentsForCalculations = data.favoriteReport
      ? data.allMoviments || data.moviments
      : data.moviments;

    const initialBalance =
      data.cashRegister.initialBalance ??
      data.cashRegister.balance -
        data.cashRegister.totalIncome +
        data.cashRegister.totalExpense;
    const receivedValues = movimentsForCalculations
      .filter((m) => String(m.type).toUpperCase() === 'INCOME')
      .reduce((sum, m) => sum + m.value, 0);
    const expenses = data.cashRegister.totalExpense;
    const finalBalance = data.cashRegister.balance;

    const summaryTable = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Saldo Inicial', style: 'label' },
            { text: formatCurrency(initialBalance), style: 'value' },
          ],
          [
            { text: 'Valores recebidos', style: 'label' },
            { text: formatCurrency(receivedValues), style: 'value' },
          ],
          [
            { text: 'Despesas', style: 'labelRed' },
            { text: formatCurrency(expenses), style: 'valueRed' },
          ],
          [
            { text: 'Saldo Final', style: 'labelBlue' },
            { text: formatCurrency(finalBalance), style: 'valueBlue' },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: (i: number, node: any) =>
          i === 0 || i === node.table.widths.length ? 1 : 0,
        hLineColor: () => '#111111',
        vLineColor: () => '#111111',
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
      margin: [0, 0, 0, 20],
    };

    const originLabelByKey = {
      INSCRICOES: 'Inscrições',
      ONSITE: 'Inscrição Avulsa',
      TICKET: 'Alimentação',
    } as const;

    const originKey = (
      origin: string,
    ): keyof typeof originLabelByKey | null => {
      const o = String(origin).toUpperCase();
      if (o === 'ASAAS' || o === 'INTERNAL') return 'INSCRICOES';
      if (o === 'ONSITE') return 'ONSITE';
      if (o === 'TICKET') return 'TICKET';
      return null;
    };

    const methodKey = (method: string) => String(method).toUpperCase();

    const incomeMoviments = movimentsForCalculations.filter(
      (m) => String(m.type).toUpperCase() === 'INCOME',
    );

    const methodsInOrder = ['DINHEIRO', 'CARTAO', 'PIX'] as const;
    const originsInOrder = ['INSCRICOES', 'ONSITE', 'TICKET'] as const;

    const totalsByMethodAndOrigin: Record<
      (typeof methodsInOrder)[number],
      Record<(typeof originsInOrder)[number], number>
    > = {
      DINHEIRO: { INSCRICOES: 0, ONSITE: 0, TICKET: 0 },
      CARTAO: { INSCRICOES: 0, ONSITE: 0, TICKET: 0 },
      PIX: { INSCRICOES: 0, ONSITE: 0, TICKET: 0 },
    };

    for (const m of incomeMoviments) {
      const mk = methodKey(m.method);
      if (!methodsInOrder.includes(mk as any)) continue;
      const ok = originKey(m.origin);
      if (!ok) continue;
      totalsByMethodAndOrigin[mk as (typeof methodsInOrder)[number]][ok] +=
        m.value;
    }

    const totalsByOrigin: Record<(typeof originsInOrder)[number], number> = {
      INSCRICOES: 0,
      ONSITE: 0,
      TICKET: 0,
    };
    for (const ok of originsInOrder) {
      totalsByOrigin[ok] = methodsInOrder.reduce(
        (sum, mk) => sum + totalsByMethodAndOrigin[mk][ok],
        0,
      );
    }
    const grandTotal = originsInOrder.reduce(
      (sum, ok) => sum + totalsByOrigin[ok],
      0,
    );

    const paymentTotalsTable = {
      fontSize: 9,
      table: {
        headerRows: 1,
        widths: [135, 92, 102, 90, 70],
        body: [
          [
            { text: 'Meio de Pagamento', style: 'tableHeader' },
            { text: originLabelByKey.INSCRICOES, style: 'tableHeader' },
            { text: originLabelByKey.ONSITE, style: 'tableHeader' },
            { text: originLabelByKey.TICKET, style: 'tableHeader' },
            { text: 'Total', style: 'tableHeader', alignment: 'right' },
          ],
          ...methodsInOrder.map((mk) => {
            const rowTotal = originsInOrder.reduce(
              (sum, ok) => sum + totalsByMethodAndOrigin[mk][ok],
              0,
            );
            return [
              { text: toPortugueseMethod(mk), style: 'tableCell' },
              {
                text: formatCurrency(totalsByMethodAndOrigin[mk].INSCRICOES),
                style: 'tableCell',
                alignment: 'right',
              },
              {
                text: formatCurrency(totalsByMethodAndOrigin[mk].ONSITE),
                style: 'tableCell',
                alignment: 'right',
              },
              {
                text: formatCurrency(totalsByMethodAndOrigin[mk].TICKET),
                style: 'tableCell',
                alignment: 'right',
              },
              {
                text: formatCurrency(rowTotal),
                style: 'tableCellBold',
                alignment: 'right',
              },
            ];
          }),
          [
            { text: 'TOTAL', style: 'tableCellBold' },
            {
              text: formatCurrency(totalsByOrigin.INSCRICOES),
              style: 'tableCellBold',
              alignment: 'right',
            },
            {
              text: formatCurrency(totalsByOrigin.ONSITE),
              style: 'tableCellBold',
              alignment: 'right',
            },
            {
              text: formatCurrency(totalsByOrigin.TICKET),
              style: 'tableCellBold',
              alignment: 'right',
            },
            {
              text: formatCurrency(grandTotal),
              style: 'tableCellBold',
              alignment: 'right',
            },
          ],
        ],
      },
      layout: {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => '#111111',
        vLineColor: () => '#111111',
        paddingLeft: () => 4,
        paddingRight: () => 4,
        paddingTop: () => 4,
        paddingBottom: () => 4,
      },
      margin: [0, 0, 0, 20],
    };

    const movimentsByDateContent = data.favoriteReport
      ? data.moviments.map((m) => ({
          stack: [
            // Índice acima e ao lado
            {
              columns: [
                {
                  width: 30,
                  text: [{ text: `${m.index}`, style: 'favoriteIndex' }],
                  alignment: 'left',
                  margin: [0, 0, 0, 4],
                },
                {
                  width: '*',
                  text: [],
                },
              ],
              columnGap: 0,
            },
            // Linha 1: Tipo, Método, Origem e Valor
            {
              columns: [
                {
                  width: 80,
                  text: [
                    { text: 'Tipo: ', style: 'favoriteLabel' },
                    {
                      text: `${String(m.type).toUpperCase() === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}`,
                      style:
                        String(m.type).toUpperCase() === 'INCOME'
                          ? 'typeEntrada'
                          : 'typeSaida',
                    },
                  ],
                },
                {
                  width: 120,
                  text: [
                    { text: 'Método: ', style: 'favoriteLabel' },
                    {
                      text: toPortugueseMethod(String(m.method)),
                      style: 'favoriteValue',
                    },
                  ],
                },
                {
                  width: 120,
                  text: [
                    { text: 'Origem: ', style: 'favoriteLabel' },
                    {
                      text: toPortugueseOrigin(String(m.origin)),
                      style: 'favoriteValue',
                    },
                  ],
                },
                {
                  width: 100,
                  text: [
                    { text: 'Valor: ', style: 'favoriteLabel' },
                    {
                      text: formatCurrency(m.value),
                      style: 'favoriteValueBold',
                    },
                  ],
                  alignment: 'right',
                },
              ],
              columnGap: 8,
              margin: [0, 4, 0, 8],
            },
            // Linha 2: Data, Categoria (se tiver) e Responsável
            {
              columns: [
                {
                  width: 180,
                  text: [
                    { text: 'Data: ', style: 'favoriteLabel' },
                    {
                      text: formatDateTime(m.createdAt),
                      style: 'favoriteValue',
                    },
                  ],
                },
                ...(m.category
                  ? [
                      {
                        width: 160,
                        text: [
                          { text: 'Categoria: ', style: 'favoriteLabel' },
                          {
                            text: toPortugueseCategory(m.category),
                            style: 'favoriteValue',
                          },
                        ],
                      },
                    ]
                  : []),
                {
                  width: 160,
                  text: [
                    { text: 'Responsável: ', style: 'favoriteLabel' },
                    { text: m.responsible ?? '-', style: 'favoriteValue' },
                  ],
                },
              ],
              columnGap: 8,
              margin: [0, 4, 0, 8],
            },
            // Linha 3: Apenas a observação
            {
              text: [
                { text: 'Observação: ', style: 'favoriteLabel' },
                { text: m.description ?? '-', style: 'favoriteValue' },
              ],
              margin: [0, 4, 0, 10],
            },
            // Linha separadora
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0,
                  y1: 0,
                  x2: 520,
                  y2: 0,
                  lineWidth: 0.5,
                  lineColor: '#dddddd',
                },
              ],
              margin: [0, 0, 0, 0],
            },
          ],
          keepTogether: true,
        }))
      : (() => {
          const dateGroups = new Map<
            string,
            CashRegisterReportPdfData['moviments']
          >();
          const dateKeysInOrder: string[] = [];

          for (const m of data.moviments) {
            const key = formatDate(m.createdAt);
            const current = dateGroups.get(key);
            if (!current) {
              dateGroups.set(key, [m]);
              dateKeysInOrder.push(key);
              continue;
            }
            current.push(m);
          }

          return dateKeysInOrder.flatMap((dateKey, groupIdx) => {
            const moviments = dateGroups.get(dateKey) ?? [];
            const movimentsBody = [
              [
                { text: '#', style: 'tableHeader' },
                { text: 'Método', style: 'tableHeader' },
                { text: 'Origem', style: 'tableHeader' },
                { text: 'Valor', style: 'tableHeader' },
                { text: 'Data', style: 'tableHeader' },
              ],
              ...moviments.map((m, idx) => [
                { text: String(idx + 1), style: 'tableCell' },
                {
                  text: toPortugueseMethod(String(m.method)),
                  style: 'tableCell',
                },
                {
                  text: toPortugueseOrigin(String(m.origin)),
                  style: 'tableCell',
                },
                {
                  text: formatCurrency(m.value),
                  style: 'tableCell',
                  alignment: 'right',
                },
                { text: formatDate(m.createdAt), style: 'tableCell' },
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

            const dateHeaderMarginTop = groupIdx === 0 ? 8 : 24;
            return [
              {
                text: dateKey,
                style: 'sectionTitle',
                margin: [0, dateHeaderMarginTop, 0, 8],
              },
              movimentsTable,
            ];
          });
        })();

    const docDefinition: any = {
      pageMargins: [32, 32, 32, 32],
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        color: '#222222',
      },
      content: [
        ...headerContent,
        {
          text: periodText,
          style: 'headerSubtitle',
          alignment: 'left',
          margin: [0, 0, 0, 14],
        },
        {
          text: 'Resumo do Caixa',
          style: 'sectionTitle',
          margin: [0, 0, 0, 8],
        },
        summaryTable,
        {
          text: 'Total por Meio de Pagamento',
          style: 'sectionTitle',
          margin: [0, 0, 0, 8],
        },
        paymentTotalsTable,
        { text: 'Movimentações', style: 'sectionTitle', margin: [0, 8, 0, 8] },
        ...movimentsByDateContent,
      ],
      styles: {
        headerTitle: { fontSize: 18, bold: true, color: '#1b1f23' },
        headerSubtitle: { fontSize: 12, bold: true },
        headerTitleDetail: { fontSize: 12, bold: true, color: '#1b1f23' },
        sectionTitle: { fontSize: 12, bold: true },
        label: { bold: true, color: '#333333' },
        labelBlue: { bold: true, color: '#1d4ed8' },
        valueBlue: { bold: true, color: '#1d4ed8' },
        labelRed: { bold: true, color: '#dc2626' },
        valueRed: { bold: true, color: '#dc2626' },
        value: { color: '#111111' },
        tableHeader: { bold: true, fillColor: '#f3f4f6', margin: [0, 4, 0, 4] },
        tableCell: { margin: [0, 3, 0, 3] },
        tableCellBold: { bold: true, margin: [0, 3, 0, 3] },
        favoriteIndex: {
          fontSize: 13,
          bold: true,
          color: '#000000',
        },
        favoriteLabel: { fontSize: 10, bold: true, color: '#333333' },
        favoriteValue: { fontSize: 10, color: '#111111' },
        favoriteValueBold: { fontSize: 10, bold: true, color: '#111111' },
        typeEntrada: { fontSize: 10, bold: true, color: '#00B894' },
        typeSaida: { fontSize: 10, bold: true, color: '#E74C3C' },
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
