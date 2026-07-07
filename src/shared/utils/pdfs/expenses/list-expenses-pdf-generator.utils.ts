import { CategoryExpense, PaymentMethod } from 'generated/prisma';
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

export type ListExpensesPdf = {
  description: string;
  value: number;
  paymentMethod: PaymentMethod;
  responsible: string;
  category: CategoryExpense;
  createdAt: Date | string;
};

export type ExpensesByCategory = {
  category: CategoryExpense;
  categoryFormatted: string;
  expenses: ListExpensesPdf[];
  totalByCategory: number;
  totalByCategoryFormatted: string;
};

export type CategorySummaryItem = {
  category: CategoryExpense;
  categoryFormatted: string;
  count: number;
  totalValue: number;
  totalFormatted: string;
  percentage?: number;
  percentageFormatted?: string;
};

export type ListExpensesPdfData = {
  header: PdfHeaderDefinition;
  expensesByCategory: ExpensesByCategory[];
  categorySummary: CategorySummaryItem[];
  totalExpenses: number;
  totalExpensesFormatted: string;
};

export class ListExpensesPdfGeneratorUtils {
  public static generateListExpensesPdf(
    data: ListExpensesPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection(data.header);

    // Calcula as porcentagens para o categorySummary
    const categorySummaryWithPercentage = data.categorySummary.map((item) => {
      const percentage =
        data.totalExpenses > 0
          ? (item.totalValue / data.totalExpenses) * 100
          : 0;
      return {
        ...item,
        percentage,
        percentageFormatted: `${percentage.toFixed(1)}%`,
      };
    });

    const content = [
      ...headerContent,
      ...this.buildSummaryContent({
        ...data,
        categorySummary: categorySummaryWithPercentage,
      }),
      ...this.buildExpensesByCategoryContent(data.expensesByCategory),
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
              text: `Documento gerado em ${this.formatDateTime(generatedAt)}`,
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
        categoryTitle: {
          fontSize: 12,
          bold: true,
          color: '#2d3748',
          margin: [0, 8, 0, 4],
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

  private static buildSummaryContent(
    data: ListExpensesPdfData & {
      categorySummary: (CategorySummaryItem & {
        percentage: number;
        percentageFormatted: string;
      })[];
    },
  ) {
    const { totalExpensesFormatted, expensesByCategory, categorySummary } =
      data;

    const totalCategories = categorySummary.length;
    const totalItems = expensesByCategory.reduce(
      (sum, category) => sum + category.expenses.length,
      0,
    );

    const content: any[] = [
      {
        text: 'Resumo Geral',
        style: 'sectionTitle',
        margin: [0, 0, 0, 12],
      },
      {
        columns: [
          {
            width: '33%',
            stack: [
              { text: 'Total de Gastos', style: 'labelText' },
              {
                text: totalExpensesFormatted,
                style: 'valueText',
                fontSize: 14,
                bold: true,
                color: '#2f855a',
              },
            ],
          },
          {
            width: '33%',
            stack: [
              { text: 'Total de Itens', style: 'labelText' },
              { text: String(totalItems), style: 'valueText' },
            ],
          },
          {
            width: '33%',
            stack: [
              { text: 'Total de Categorias', style: 'labelText' },
              { text: String(totalCategories), style: 'valueText' },
            ],
          },
        ],
        margin: [0, 0, 0, 16],
      },
    ];

    // Resumo por categoria usando o categorySummary do gateway com porcentagem
    if (categorySummary.length > 0) {
      content.push(
        {
          text: 'Resumo por Categoria',
          style: 'subsectionTitle',
          margin: [0, 0, 0, 6],
        },
        this.buildCategorySummaryTable(categorySummary),
      );
    }

    // Linha separadora e quebra de página após o resumo
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

  private static buildExpensesByCategoryContent(
    expensesByCategory: ExpensesByCategory[],
  ) {
    if (!expensesByCategory.length || expensesByCategory.length === 0) {
      return [
        {
          text: 'Nenhum gasto encontrado para o período selecionado.',
          italics: true,
          alignment: 'center',
          margin: [0, 40, 0, 0],
        },
      ];
    }

    const content: any[] = [
      {
        text: 'Lista de Gastos por Categoria',
        style: 'sectionTitle',
        margin: [0, 0, 0, 12],
      },
    ];

    // Para cada categoria, mostrar sua tabela de gastos
    expensesByCategory.forEach((categoryData, index) => {
      // Adiciona a categoria
      content.push(
        {
          text: `${categoryData.categoryFormatted}`,
          style: 'categoryTitle',
          margin: [0, index === 0 ? 0 : 16, 0, 4],
        },
        {
          columns: [
            {
              width: '70%',
              stack: [{ text: ' ', style: 'labelText' }],
            },
            {
              width: '30%',
              stack: [
                {
                  text: `Total: ${categoryData.totalByCategoryFormatted}`,
                  style: 'valueText',
                  alignment: 'right',
                  bold: true,
                  color: '#2f855a',
                },
              ],
            },
          ],
          margin: [0, 0, 0, 8],
        },
        this.buildExpensesTable(categoryData.expenses),
      );

      // Adiciona quebra de página após cada categoria (exceto na última)
      if (index < expensesByCategory.length - 1) {
        content.push({
          text: '',
          pageBreak: 'after',
          margin: [0, 0, 0, 0],
        });
      }
    });

    return content;
  }

  private static buildExpensesTable(expenses: ListExpensesPdf[]) {
    if (!expenses.length) {
      return {
        text: 'Nenhum gasto registrado nesta categoria.',
        italics: true,
        alignment: 'center',
        margin: [0, 8, 0, 8],
      };
    }

    return {
      table: {
        headerRows: 1,
        widths: ['35%', '20%', '25%', '20%'],
        body: [
          [
            { text: 'Descrição', style: 'tableHeader' },
            {
              text: 'Método de Pagamento',
              style: 'tableHeader',
              alignment: 'center',
            },
            { text: 'Responsável', style: 'tableHeader', alignment: 'center' },
            { text: 'Valor', style: 'tableHeader', alignment: 'right' },
          ],
          ...expenses.map((expense) => [
            { text: expense.description || '-', style: 'tableRow' },
            {
              text: this.formatPaymentMethod(expense.paymentMethod),
              style: 'tableRow',
              alignment: 'center',
            },
            {
              text: expense.responsible || '-',
              style: 'tableRow',
              alignment: 'center',
            },
            {
              text: this.formatCurrency(expense.value),
              style: 'tableRow',
              alignment: 'right',
            },
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

  private static buildCategorySummaryTable(
    categorySummary: (CategorySummaryItem & {
      percentage: number;
      percentageFormatted: string;
    })[],
  ) {
    // Ordena por totalValue decrescente para melhor visualização
    const sortedCategories = [...categorySummary].sort(
      (a, b) => b.totalValue - a.totalValue,
    );

    return {
      table: {
        headerRows: 1,
        widths: ['35%', '20%', '25%', '20%'],
        body: [
          [
            { text: 'Categoria', style: 'tableHeader' },
            { text: 'Quantidade', style: 'tableHeader', alignment: 'center' },
            { text: 'Total', style: 'tableHeader', alignment: 'right' },
            { text: '% do Total', style: 'tableHeader', alignment: 'right' },
          ],
          ...sortedCategories.map((category) => [
            { text: category.categoryFormatted, style: 'tableRow' },
            {
              text: String(category.count),
              style: 'tableRow',
              alignment: 'center',
            },
            {
              text: category.totalFormatted,
              style: 'tableRow',
              alignment: 'right',
            },
            {
              text: category.percentageFormatted,
              style: 'tableRow',
              alignment: 'right',
            },
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

  private static formatDateTime(date: Date | string): string {
    return new Date(date).toLocaleString('pt-BR');
  }

  private static formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  private static formatPaymentMethod(method: PaymentMethod): string {
    const methodMap: Record<PaymentMethod, string> = {
      PIX: 'PIX',
      CARTAO: 'Cartão',
      DINHEIRO: 'Dinheiro',
    };
    return methodMap[method] || String(method);
  }
}
