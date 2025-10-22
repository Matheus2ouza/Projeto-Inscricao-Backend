import path from 'path';
import PdfPrinter from 'pdfmake';

// Configurar fontes do diretório public
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

type ReportGeneralPdfGeneratorOptions = {
  eventImageDataUrl?: string;
};

// Instancia o printer com as fontes reais (sem base64/vfs)
const printer = new PdfPrinter(fonts);

export class ReportGeneralPdfGeneratorUtils {
  public static generateReportPdf(
    relatorioData: any,
    options: ReportGeneralPdfGeneratorOptions = {},
  ): Promise<Buffer> {
    const eventHeaderColumns = options.eventImageDataUrl
      ? [
          {
            width: 100,
            image: options.eventImageDataUrl,
            fit: [100, 70],
            alignment: 'left',
          },
          {
            width: '*',
            text: relatorioData.event.name
              ? `RELATÓRIO GERAL: ${relatorioData.event.name.toUpperCase()}`
              : 'RELATÓRIO GERAL',
            style: 'eventTitle',
            fontSize: 22,
            bold: true,
            alignment: 'left',
          },
        ]
      : [
          {
            width: '*',
            text: relatorioData.event.name
              ? `RELATÓRIO GERAL: ${relatorioData.event.name.toUpperCase()}`
              : 'RELATÓRIO GERAL',
            style: 'eventTitle',
            fontSize: 22,
            bold: true,
            alignment: 'left',
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
      content: [
        {
          columns: eventHeaderColumns,
          columnGap: 16,
          margin: [0, 0, 0, 10],
        },
        {
          text: `Relatório geral sobre o evento "${relatorioData.event.name}", que ocorreu do dia ${new Date(relatorioData.event.startDate).toLocaleDateString('pt-BR')} ao dia ${new Date(relatorioData.event.endDate).toLocaleDateString('pt-BR')}${relatorioData.event.location ? ` no local ${relatorioData.event.location}` : ''}.`,
          fontSize: 10,
          style: 'summaryText',
          margin: [0, 0, 0, 20],
        },

        // Seção Financeiro
        {
          text: 'FINANCEIRO',
          style: 'subheader',
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              width: '33%',
              stack: [
                this.criarCardTotal(
                  'TOTAL GERAL',
                  `R$ ${relatorioData.totais.totalGeral.toFixed(2)}`,
                  'total',
                ),
                this.criarCardTotal(
                  'VALOR ARRECADADO',
                  `R$ ${relatorioData.totais.totalArrecadado.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '33%',
              stack: [
                this.criarCardTotal(
                  'DINHEIRO',
                  `R$ ${relatorioData.totais.totalDinheiro.toFixed(2)}`,
                ),
                this.criarCardTotal(
                  'PIX',
                  `R$ ${relatorioData.totais.totalPix.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '33%',
              stack: [
                this.criarCardTotal(
                  'CARTÃO',
                  `R$ ${relatorioData.totais.totalCartao.toFixed(2)}`,
                ),
                this.criarCardTotal(
                  'GASTOS',
                  `R$ ${relatorioData.totais.totalGastos.toFixed(2)}`,
                  'gasto',
                ),
              ],
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 25],
        },

        // Seção Dados Gerais
        {
          text: 'DADOS GERAIS',
          style: 'subheader',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            widths: ['25%', '25%', '25%', '25%'],
            body: [
              [
                { text: 'Inscrições em Grupo', style: 'tableHeader' },
                { text: 'Participantes', style: 'tableHeader' },
                { text: 'Inscrições Avulsas', style: 'tableHeader' },
                { text: 'Participantes Avulsos', style: 'tableHeader' },
              ],
              [
                {
                  text: relatorioData.inscricoes.inscricoes.length.toString(),
                  style: 'highlight',
                },
                {
                  text: relatorioData.inscricoes.totalParticipantes.toString(),
                  style: 'highlight',
                },
                {
                  text: relatorioData.inscricoesAvulsas.inscricoes.length.toString(),
                  style: 'highlight',
                },
                {
                  text: relatorioData.inscricoesAvulsas.totalParticipantes.toString(),
                  style: 'highlight',
                },
              ],
              [
                { text: 'Vendas de Tickets', style: 'tableHeader' },
                { text: 'Quantidade Vendida', style: 'tableHeader' },
                { text: 'Gastos Registrados', style: 'tableHeader' },
                { text: '', style: 'tableRow' },
              ],
              [
                {
                  text: relatorioData.tickets.vendas.length.toString(),
                  style: 'highlight',
                },
                {
                  text: relatorioData.tickets.vendas
                    .reduce((sum, v) => sum + v.quantitySold, 0)
                    .toString(),
                  style: 'highlight',
                },
                {
                  text: relatorioData.gastos.gastos.length.toString(),
                  style: 'highlight',
                },
                { text: '', style: 'tableRow' },
              ],
            ],
          },
          layout: {
            hLineWidth: (i, node) =>
              i === 0 || i === node.table.body.length ? 2 : 1,
            vLineWidth: (i, node) =>
              i === 0 || i === node.table.widths.length ? 2 : 1,
            hLineColor: (i, node) =>
              i === 0 || i === node.table.body.length ? '#2d3748' : '#e2e8f0',
            vLineColor: (i, node) =>
              i === 0 || i === node.table.widths.length ? '#2d3748' : '#e2e8f0',
          },
          margin: [0, 0, 0, 25],
        },

        // Quebra de página para Inscrições em Grupo
        { text: '', pageBreak: 'before' },
        {
          text: 'INSCRIÇÕES EM GRUPO',
          style: 'subheader',
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'TOTAL',
                  `R$ ${relatorioData.inscricoes.total.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'DINHEIRO',
                  `R$ ${relatorioData.inscricoes.totalDinheiro.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'PIX',
                  `R$ ${relatorioData.inscricoes.totalPix.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'CARTÃO',
                  `R$ ${relatorioData.inscricoes.totalCartao.toFixed(2)}`,
                ),
              ],
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 25],
        },
        ...this.gerarDetalhesInscricoes(
          relatorioData.inscricoes.inscricoes,
          'INSCRIÇÕES EM GRUPO',
        ),

        // Quebra de página para Inscrições Avulsas
        { text: '', pageBreak: 'before' },
        {
          text: 'INSCRIÇÕES AVULSAS',
          style: 'subheader',
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'TOTAL',
                  `R$ ${relatorioData.inscricoesAvulsas.total.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'DINHEIRO',
                  `R$ ${relatorioData.inscricoesAvulsas.totalDinheiro.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'PIX',
                  `R$ ${relatorioData.inscricoesAvulsas.totalPix.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'CARTÃO',
                  `R$ ${relatorioData.inscricoesAvulsas.totalCartao.toFixed(2)}`,
                ),
              ],
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 25],
        },
        ...this.gerarDetalhesInscricoes(
          relatorioData.inscricoesAvulsas.inscricoes,
          'INSCRIÇÕES AVULSAS',
        ),

        // Quebra de página para Tickets
        { text: '', pageBreak: 'before' },
        {
          text: 'VENDAS DE TICKETS',
          style: 'subheader',
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'TOTAL',
                  `R$ ${relatorioData.tickets.total.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'DINHEIRO',
                  `R$ ${relatorioData.tickets.totalDinheiro.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'PIX',
                  `R$ ${relatorioData.tickets.totalPix.toFixed(2)}`,
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'CARTÃO',
                  `R$ ${relatorioData.tickets.totalCartao.toFixed(2)}`,
                ),
              ],
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 25],
        },
        ...this.gerarDetalhesTickets(relatorioData.tickets.vendas),

        // Quebra de página para Gastos
        { text: '', pageBreak: 'before' },
        {
          text: 'GASTOS',
          style: 'subheader',
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'TOTAL',
                  `R$ ${relatorioData.gastos.total.toFixed(2)}`,
                  'gasto',
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'DINHEIRO',
                  `R$ ${relatorioData.gastos.totalDinheiro.toFixed(2)}`,
                  'gasto',
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'PIX',
                  `R$ ${relatorioData.gastos.totalPix.toFixed(2)}`,
                  'gasto',
                ),
              ],
            },
            {
              width: '25%',
              stack: [
                this.criarCardTotal(
                  'CARTÃO',
                  `R$ ${relatorioData.gastos.totalCartao.toFixed(2)}`,
                  'gasto',
                ),
              ],
            },
          ],
          columnGap: 10,
          margin: [0, 0, 0, 25],
        },
        ...this.gerarDetalhesGastos(relatorioData.gastos.gastos),

        {
          text: `Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`,
          style: 'footer',
          alignment: 'center',
          margin: [0, 20, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          color: '#1a365d',
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          color: '#2d3748',
          margin: [0, 15, 0, 8],
          bold: true,
          background: '#f7fafc',
          border: [false, false, false, true],
          borderColor: '#e2e8f0',
          borderWidth: 3,
          padding: [8, 0, 8, 0],
        },
        footer: {
          fontSize: 9,
          color: '#718096',
          alignment: 'center',
          margin: [0, 20, 0, 0],
        },
        eventTitle: {
          fontSize: 24,
          color: '#1a365d',
          bold: true,
          margin: [0, 0, 0, 5],
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          color: '#ffffff',
          fillColor: '#2d3748',
          alignment: 'center',
        },
        tableRow: {
          fontSize: 9,
          color: '#2d3748',
        },
        highlight: {
          fontSize: 11,
          bold: true,
          color: '#1a365d',
        },
        summaryTitle: {
          fontSize: 16,
          color: '#1a365d',
          bold: true,
          alignment: 'center',
        },
        summaryText: {
          fontSize: 12,
          color: '#2d3748',
          alignment: 'center',
        },
        cardHeader: {
          fontSize: 10,
          bold: true,
          color: '#ffffff',
          alignment: 'center',
          fillColor: '#2d3748',
        },
        cardValue: {
          fontSize: 14,
          bold: false,
          color: '#1a365d',
          alignment: 'center',
        },
        cardValueTotal: {
          fontSize: 14,
          bold: true,
          color: '#1a365d',
          alignment: 'center',
        },
        cardValueGasto: {
          fontSize: 14,
          bold: false,
          color: '#dc2626',
          alignment: 'center',
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

  private static gerarDetalhesInscricoes(inscricoes: any[], titulo: string) {
    if (inscricoes.length === 0) return [];

    const detalhes = inscricoes.map((i) => [
      { text: i.responsible, alignment: 'left' },
      { text: i.countParticipants.toString(), alignment: 'center' },
      { text: `R$ ${i.totalValue.toFixed(2)}`, alignment: 'right' },
      {
        text: new Date(i.createdAt).toLocaleDateString('pt-BR'),
        alignment: 'right',
      },
    ]);

    return [
      {
        text: `DETALHES DAS ${titulo}`,
        style: 'subheader',
        margin: [0, 20, 0, 10],
      },
      {
        table: {
          widths: ['40%', '20%', '20%', '20%'],
          body: [
            [
              { text: 'Responsável', style: 'tableHeader', alignment: 'left' },
              {
                text: 'Participantes',
                style: 'tableHeader',
                alignment: 'center',
              },
              { text: 'Valor', style: 'tableHeader', alignment: 'right' },
              { text: 'Data', style: 'tableHeader', alignment: 'right' },
            ],
            ...detalhes,
          ],
        },
        layout: {
          hLineWidth: (i, node) =>
            i === 0 || i === node.table.body.length ? 2 : 1,
          vLineWidth: (i, node) =>
            i === 0 || i === node.table.widths.length ? 2 : 1,
          hLineColor: (i, node) =>
            i === 0 || i === node.table.body.length ? '#2d3748' : '#e2e8f0',
          vLineColor: (i, node) =>
            i === 0 || i === node.table.widths.length ? '#2d3748' : '#e2e8f0',
        },
        margin: [0, 0, 0, 25],
      },
    ];
  }

  private static gerarDetalhesTickets(vendas: any[]) {
    if (vendas.length === 0) return [];

    const detalhes = vendas.map((v) => [
      { text: v.name, alignment: 'left' },
      { text: v.quantitySold.toString(), alignment: 'center' },
      { text: `R$ ${v.totalValue.toFixed(2)}`, alignment: 'right' },
      {
        text: new Date(v.createdAt).toLocaleDateString('pt-BR'),
        alignment: 'right',
      },
    ]);

    return [
      {
        text: 'DETALHES DAS VENDAS DE TICKETS',
        style: 'subheader',
        margin: [0, 20, 0, 10],
      },
      {
        table: {
          widths: ['40%', '20%', '20%', '20%'],
          body: [
            [
              {
                text: 'Nome do Ticket',
                style: 'tableHeader',
                alignment: 'left',
              },
              {
                text: 'Quantidade Vendida',
                style: 'tableHeader',
                alignment: 'center',
              },
              { text: 'Valor Total', style: 'tableHeader', alignment: 'right' },
              { text: 'Data', style: 'tableHeader', alignment: 'right' },
            ],
            ...detalhes,
          ],
        },
        layout: {
          hLineWidth: (i, node) =>
            i === 0 || i === node.table.body.length ? 2 : 1,
          vLineWidth: (i, node) =>
            i === 0 || i === node.table.widths.length ? 2 : 1,
          hLineColor: (i, node) =>
            i === 0 || i === node.table.body.length ? '#2d3748' : '#e2e8f0',
          vLineColor: (i, node) =>
            i === 0 || i === node.table.widths.length ? '#2d3748' : '#e2e8f0',
        },
        margin: [0, 0, 0, 25],
      },
    ];
  }

  private static gerarDetalhesGastos(gastos: any[]) {
    if (gastos.length === 0) return [];

    const detalhes = gastos.map((g) => [
      { text: g.description, alignment: 'left' },
      { text: g.paymentMethod, alignment: 'center' },
      { text: g.responsible, alignment: 'center' },
      { text: `R$ ${g.value.toFixed(2)}`, alignment: 'right' },
      {
        text: new Date(g.createdAt).toLocaleDateString('pt-BR'),
        alignment: 'right',
      },
    ]);

    return [
      {
        text: 'DETALHES DOS GASTOS',
        style: 'subheader',
        margin: [0, 20, 0, 10],
      },
      {
        table: {
          widths: ['30%', '15%', '15%', '20%', '20%'],
          body: [
            [
              { text: 'Descrição', style: 'tableHeader', alignment: 'left' },
              {
                text: 'Método de Pagamento',
                style: 'tableHeader',
                alignment: 'center',
              },
              {
                text: 'Responsável',
                style: 'tableHeader',
                alignment: 'center',
              },
              { text: 'Valor', style: 'tableHeader', alignment: 'right' },
              { text: 'Data', style: 'tableHeader', alignment: 'right' },
            ],
            ...detalhes,
          ],
        },
        layout: {
          hLineWidth: (i, node) =>
            i === 0 || i === node.table.body.length ? 2 : 1,
          vLineWidth: (i, node) =>
            i === 0 || i === node.table.widths.length ? 2 : 1,
          hLineColor: (i, node) =>
            i === 0 || i === node.table.body.length ? '#2d3748' : '#e2e8f0',
          vLineColor: (i, node) =>
            i === 0 || i === node.table.widths.length ? '#2d3748' : '#e2e8f0',
        },
        margin: [0, 0, 0, 25],
      },
    ];
  }

  private static criarCardTotal(
    titulo: string,
    valor: string,
    estilo: 'normal' | 'total' | 'gasto' = 'normal',
  ) {
    let valorStyle = 'cardValue';
    if (estilo === 'total') {
      valorStyle = 'cardValueTotal';
    } else if (estilo === 'gasto') {
      valorStyle = 'cardValueGasto';
    }

    return {
      table: {
        widths: ['*'],
        body: [
          [{ text: titulo, style: 'cardHeader' }],
          [{ text: valor, style: valorStyle }],
        ],
      },
      layout: {
        hLineWidth: (i, node) => {
          if (i === 0 || i === node.table.body.length) return 2; // Linha azul no topo e embaixo
          if (i === 1) return 2; // Linha azul entre título e valor
          return 0;
        },
        vLineWidth: () => 2, // Linha azul nas laterais
        hLineColor: (i, node) => {
          if (i === 0 || i === node.table.body.length || i === 1)
            return '#2d3748'; // Cor azul para todas as linhas horizontais
          return '#000000';
        },
        vLineColor: () => '#2d3748', // Cor azul para as linhas verticais
        paddingTop: () => 8,
        paddingBottom: () => 8,
        paddingLeft: () => 4,
        paddingRight: () => 4,
      },
      margin: [0, 0, 0, 10],
    };
  }
}
