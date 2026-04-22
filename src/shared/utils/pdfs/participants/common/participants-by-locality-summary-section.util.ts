import type { TDocumentDefinitions } from 'pdfmake/interfaces';

export type ParticipantLocalityReportSummary = {
  totalParticipants: number;
  genderCount: Record<string, number>;
  shirtSizeCount: Record<string, number>;
};

type PdfMakeStyleDict = NonNullable<TDocumentDefinitions['styles']>;

export const participantsByLocalitySummaryStyles: PdfMakeStyleDict = {
  summaryTitle: {
    fontSize: 18,
    bold: true,
    color: '#1a365d',
    margin: [0, 0, 0, 15],
  },
  summaryCardTitle: {
    fontSize: 12,
    bold: true,
    color: '#2d3748',
    margin: [0, 0, 0, 8],
    decoration: 'underline',
    decorationColor: '#cbd5e0',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1a202c',
    margin: [0, 0, 0, 6],
  },
  summaryItem: {
    fontSize: 10,
    color: '#4a5568',
    margin: [0, 0, 0, 3],
  },
  summaryLabel: {
    fontSize: 10,
    color: '#718096',
    margin: [0, 0, 0, 2],
  },
  sectionCard: {
    margin: [0, 0, 0, 12],
  },
};

export function buildParticipantsByLocalitySummarySection(params: {
  summary: ParticipantLocalityReportSummary;
  formatGender: (gender: string) => string;
}): any[] {
  const { summary, formatGender } = params;

  // Gênero items em grid de 3 colunas para melhor aproveitamento
  const genderItems: any[] = [];
  const genders = Object.entries(summary.genderCount).sort(([a], [b]) =>
    String(a).localeCompare(String(b), 'pt-BR'),
  );

  if (genders.length > 0) {
    const gridRows: any[] = [];
    const chunkSize = 3;

    for (let i = 0; i < genders.length; i += chunkSize) {
      const rowItems = genders.slice(i, i + chunkSize);
      const columns = rowItems.map(([gender, count]) => ({
        stack: [
          {
            text: formatGender(gender),
            style: 'summaryLabel',
            alignment: 'center',
          },
          {
            text: String(count),
            style: 'summaryItem',
            alignment: 'center',
            bold: true,
          },
        ],
        width: '33.33%',
      }));

      while (columns.length < chunkSize) {
        columns.push({
          stack: [
            { text: '', style: 'summaryLabel', alignment: 'center' },
            { text: '', style: 'summaryItem', alignment: 'center', bold: true },
          ],
          width: '33.33%',
        });
      }

      gridRows.push({
        columns: columns,
        margin: [0, 0, 0, 5],
      });
    }

    genderItems.push(...gridRows);
  } else {
    genderItems.push({ text: '-', style: 'summaryItem' });
  }

  // Tamanhos de camisa em grid de 3 colunas
  const shirtSizeItems: any[] = [];
  const sizes = Object.entries(summary.shirtSizeCount).sort(([a], [b]) =>
    String(a).localeCompare(String(b), 'pt-BR'),
  );

  if (sizes.length > 0) {
    const gridRows: any[] = [];
    const chunkSize = 3;

    for (let i = 0; i < sizes.length; i += chunkSize) {
      const rowItems = sizes.slice(i, i + chunkSize);
      const columns = rowItems.map(([size, count]) => ({
        stack: [
          {
            text: size,
            style: 'summaryLabel',
            alignment: 'center',
          },
          {
            text: String(count),
            style: 'summaryItem',
            alignment: 'center',
            bold: true,
          },
        ],
        width: '33.33%',
      }));

      while (columns.length < chunkSize) {
        columns.push({
          stack: [
            { text: '', style: 'summaryLabel', alignment: 'center' },
            { text: '', style: 'summaryItem', alignment: 'center', bold: true },
          ],
          width: '33.33%',
        });
      }

      gridRows.push({
        columns: columns,
        margin: [0, 0, 0, 5],
      });
    }

    shirtSizeItems.push(...gridRows);
  } else {
    shirtSizeItems.push({ text: '-', style: 'summaryItem' });
  }

  // Calcular estatísticas adicionais
  const totalGenders = Object.values(summary.genderCount).reduce(
    (a, b) => a + b,
    0,
  );
  const totalShirtSizes = Object.values(summary.shirtSizeCount).reduce(
    (a, b) => a + b,
    0,
  );

  return [
    { text: 'Resumo Estatístico', style: 'summaryTitle' },

    // Seção 1: Total de Participantes
    {
      table: {
        widths: ['100%'],
        body: [
          [
            {
              stack: [
                { text: 'Total de Participantes', style: 'summaryCardTitle' },
                {
                  text: String(summary.totalParticipants),
                  style: 'summaryValue',
                  bold: true,
                  fontSize: 16,
                  alignment: 'center',
                },
                {
                  text: 'Participantes confirmados',
                  style: 'summaryLabel',
                  fontSize: 9,
                  margin: [0, 4, 0, 0],
                  alignment: 'center',
                },
              ],
              margin: [0, 0, 0, 0],
            },
          ],
        ],
      },
      layout: {
        fillColor: () => '#ebf8ff',
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 15,
        paddingRight: () => 15,
        paddingTop: () => 12,
        paddingBottom: () => 12,
      },
      margin: [0, 0, 0, 10],
    },

    // Seção 2: Distribuição por Gênero
    {
      table: {
        widths: ['100%'],
        body: [
          [
            {
              stack: [
                { text: 'Distribuição por Gênero', style: 'summaryCardTitle' },
                ...genderItems,
                ...(totalGenders !== summary.totalParticipants
                  ? [
                      {
                        text: `* ${totalGenders} de ${summary.totalParticipants} especificados`,
                        style: 'summaryLabel',
                        fontSize: 8,
                        margin: [0, 8, 0, 0],
                        color: '#a0aec0',
                        alignment: 'center',
                      },
                    ]
                  : []),
              ],
              margin: [0, 0, 0, 0],
            },
          ],
        ],
      },
      layout: {
        fillColor: () => '#f7fafc',
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 15,
        paddingRight: () => 15,
        paddingTop: () => 12,
        paddingBottom: () => 12,
      },
      margin: [0, 0, 0, 10],
    },

    // Seção 3: Tamanhos de Camisa
    {
      table: {
        widths: ['100%'],
        body: [
          [
            {
              stack: [
                { text: 'Tamanhos de Camisa', style: 'summaryCardTitle' },
                ...shirtSizeItems,
                ...(totalShirtSizes !== summary.totalParticipants
                  ? [
                      {
                        text: `* ${totalShirtSizes} de ${summary.totalParticipants} especificados`,
                        style: 'summaryLabel',
                        fontSize: 8,
                        margin: [0, 8, 0, 0],
                        color: '#a0aec0',
                        alignment: 'center',
                      },
                    ]
                  : []),
              ],
              margin: [0, 0, 0, 0],
            },
          ],
        ],
      },
      layout: {
        fillColor: () => '#f7fafc',
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 15,
        paddingRight: () => 15,
        paddingTop: () => 12,
        paddingBottom: () => 12,
      },
      margin: [0, 0, 0, 5],
    },

    // Linha decorativa final
    {
      canvas: [
        {
          type: 'line',
          x1: 0,
          y1: 0,
          x2: 515,
          y2: 0,
          lineWidth: 0.5,
          lineColor: '#e2e8f0',
        },
      ],
      margin: [0, 15, 0, 5],
    },
  ];
}
