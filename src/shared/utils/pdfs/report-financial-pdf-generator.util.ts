import path from 'path'
import PdfPrinter from 'pdfmake'

const fontsPath = path.join(process.cwd(), 'public', 'fonts')

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
}

type ReportFinancialPdfGeneratorOptions = {
  eventImageDataUrl?: string
}

const printer = new PdfPrinter(fonts)

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
            stack: [
              { text: 'Relatório Financeiro', style: 'title' },
              {
                text: `${data.event.name}`,
                style: 'subtitle',
                margin: [0, 2, 0, 0],
              },
              {
                text: `${formatDate(data.event.startDate)} até ${formatDate(
                  data.event.endDate,
                )}`,
                style: 'muted',
              },
            ],
            alignment: 'right',
          },
        ]
      : [
          {
            width: '*',
            stack: [
              { text: 'Relatório Financeiro', style: 'title' },
              { text: `${data.event.name}`, style: 'subtitle' },
              {
                text: `${formatDate(data.event.startDate)} até ${formatDate(
                  data.event.endDate,
                )}`,
                style: 'muted',
              },
            ],
          },
        ]

    const totalsTable = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Totais', style: 'sectionTitle' },
            { text: formatCurrency(data.totais.totalGeral), style: 'valueMain' },
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
    }

    const inscricoesTotals = {
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
            { text: formatCurrency(data.inscricoes.totalDinheiro), style: 'value' },
          ],
          [
            { text: 'Cartão', style: 'label' },
            { text: formatCurrency(data.inscricoes.totalCartao), style: 'value' },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.inscricoes.totalPix), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    }

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
        : undefined

    const avulsTotals = {
      table: {
        widths: ['*', 'auto'],
        body: [
          [
            { text: 'Inscrições Avulsas', style: 'sectionTitle' },
            { text: formatCurrency(data.inscricoesAvulsas.total), style: 'valueMain' },
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
            { text: formatCurrency(data.inscricoesAvulsas.totalDinheiro), style: 'value' },
          ],
          [
            { text: 'Cartão', style: 'label' },
            { text: formatCurrency(data.inscricoesAvulsas.totalCartao), style: 'value' },
          ],
          [
            { text: 'Pix', style: 'label' },
            { text: formatCurrency(data.inscricoesAvulsas.totalPix), style: 'value' },
          ],
        ],
      },
      layout: 'lightHorizontalLines',
      margin: [0, 0, 0, 10],
    }

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
        : undefined

    const expensesTotals = {
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
    }

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
        : undefined

    const content = [
      { columns: headerColumns, columnGap: 20, margin: [0, 0, 0, 20] },
      totalsTable,
      inscricoesTotals,
      ...(inscricoesDetails ? [inscricoesDetails] : []),
      avulsTotals,
      ...(avulsDetails ? [avulsDetails] : []),
      expensesTotals,
      ...(expensesDetails ? [expensesDetails] : []),
    ]

    const docDefinition: any = {
      content,
      styles: {
        title: { fontSize: 18, bold: true },
        subtitle: { fontSize: 14, bold: true },
        muted: { fontSize: 10, color: '#4a5568' },
        sectionTitle: { fontSize: 12, bold: true },
        label: { fontSize: 10, color: '#2d3748' },
        value: { fontSize: 10, bold: true },
        valueMain: { fontSize: 12, bold: true },
        tableHeader: { fontSize: 10, bold: true, color: '#2d3748' },
        cell: { fontSize: 10 },
      },
      defaultStyle: {
        font: 'OpenSans',
      },
      pageMargins: [40, 40, 40, 40],
    }

    return new Promise((resolve) => {
      const doc = printer.createPdfKitDocument(docDefinition)
      const chunks: Buffer[] = []
      doc.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk))
      })
      doc.on('end', () => {
        resolve(Buffer.concat(chunks))
      })
      doc.end()
    })
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR').format(d)
}
