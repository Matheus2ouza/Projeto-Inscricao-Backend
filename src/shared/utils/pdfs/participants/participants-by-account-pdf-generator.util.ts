import path from 'path';
import PdfPrinter from 'pdfmake';
import {
  buildPdfHeaderSection,
  PdfHeaderDefinition,
} from '../common/pdf-header.util';

// Caminho das fontes
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

export type ParticipantPdfEntry = {
  id: string;
  name: string;
  typeInscription: string;
  birthDate: Date;
  gender: string;
};

export type AccountParticipantsPdfBlock = {
  accountId: string;
  username: string;
  totalParticipants: number;
  totalMale: number;
  totalFemale: number;
  participants: ParticipantPdfEntry[];
  typeCounts: { type: string; count: number }[];
};

export type ParticipantsByAccountPdfData = {
  header: PdfHeaderDefinition;
  items: AccountParticipantsPdfBlock[];
};

export class ParticipantsByAccountPdfGenerator {
  public static generateParticipantsByAccountPdf(
    data: ParticipantsByAccountPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection(data.header);

    const generatedAt = new Date();
    const content = [
      ...headerContent,
      ...this.buildAccountsContent(data.items),
    ];

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
        accountTitle: {
          fontSize: 18,
          bold: true,
          color: '#1a365d',
          lineHeight: 1.1,
        },
        accountSubtitle: {
          fontSize: 10,
          color: '#4a5568',
          margin: [0, -4, 0, 0],
          lineHeight: 1.05,
        },
        labelText: {
          fontSize: 11,
          bold: true,
          color: '#2d3748',
        },
        valueText: {
          fontSize: 10,
          color: '#1a202c',
        },
        tableHeader: {
          fontSize: 10,
          bold: true,
          fillColor: '#e2e8f0',
          color: '#1a202c',
        },
        tableRow: {
          fontSize: 9,
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

  private static buildAccountsContent(items: AccountParticipantsPdfBlock[]) {
    return items.map((account, accountIndex) => ({
      stack: [
        {
          stack: [
            {
              text: account.username,
              style: 'accountTitle',
            },
            {
              text: formatId(account.accountId),
              style: 'accountSubtitle',
            },
            {
              text: `Total de participantes: ${account.totalParticipants}`,
              style: 'labelText',
              margin: [0, 4, 0, 2],
            },
            {
              columns: [
                {
                  text: `Masculinos: ${account.totalMale}`,
                  style: 'valueText',
                },
                {
                  text: `Femininos: ${account.totalFemale}`,
                  style: 'valueText',
                },
              ],
              margin: [0, 0, 0, 6],
            },
            ...(account.typeCounts.length
              ? [
                  {
                    text: 'Inscrições por tipo:',
                    style: 'labelText',
                    margin: [0, 0, 0, 2],
                  },
                  {
                    stack: account.typeCounts.map((typeCount) => ({
                      text: `${typeCount.type}: ${typeCount.count}`,
                      style: 'valueText',
                    })),
                    margin: [0, 0, 0, 8],
                  },
                ]
              : []),
          ],
          margin: [0, 0, 0, 4],
        },
        {
          text: `Participantes (${account.totalParticipants})`,
          style: 'labelText',
          margin: [0, 4, 0, 4],
        },
        this.buildParticipantsTable(account.participants),
      ],
      margin: [0, accountIndex === 0 ? 0 : 24, 0, 0],
      pageBreak: accountIndex === items.length - 1 ? undefined : 'after',
    }));
  }

  private static buildParticipantsTable(participants: ParticipantPdfEntry[]) {
    return {
      table: {
        headerRows: 1,
        widths: ['8%', '42%', '20%', '15%', '15%'],
        body: [
          [
            { text: '#', style: 'tableHeader', alignment: 'center' },
            { text: 'Nome completo', style: 'tableHeader', alignment: 'left' },
            {
              text: 'Inscrição',
              style: 'tableHeader',
              alignment: 'center',
            },
            { text: 'Idade', style: 'tableHeader', alignment: 'center' },
            { text: 'Gênero', style: 'tableHeader', alignment: 'center' },
          ],
          ...this.buildParticipantRows(participants),
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

  private static buildParticipantRows(participants: ParticipantPdfEntry[]) {
    if (!participants.length) {
      return [
        [
          {
            text: 'Nenhum participante cadastrado para esta conta.',
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
    }

    return participants.map((participant, index) => {
      const birthDate = participant.birthDate
        ? new Date(participant.birthDate)
        : undefined;
      return [
        {
          text: (index + 1).toString(),
          alignment: 'center',
          style: 'tableRow',
        },
        { text: participant.name.toUpperCase(), style: 'tableRow' },
        {
          text: participant.typeInscription,
          alignment: 'center',
          style: 'tableRow',
        },
        {
          text: formatAge(birthDate),
          alignment: 'center',
          style: 'tableRow',
        },
        {
          text: formatGender(participant.gender),
          alignment: 'center',
          style: 'tableRow',
        },
      ];
    });
  }
}

function formatDate(date?: Date | null): string {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('pt-BR');
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('pt-BR');
}

function formatAge(date?: Date | null): string {
  if (!date) return '-';
  const birth = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? `${age}` : '-';
}

function formatGender(gender?: string | null): string {
  if (!gender) return 'Não informado';

  const genderUpper = gender.toUpperCase();
  switch (genderUpper) {
    case 'MASCULINO':
      return 'Masculino';
    case 'FEMININO':
      return 'Feminino';
    default:
      return String(gender).charAt(0) + String(gender).slice(1).toLowerCase();
  }
}

function formatId(id: string): string {
  const trimmed = id.trim();
  if (!trimmed) {
    return 'ID: -';
  }
  const visiblePart = trimmed.slice(0, 8);
  return `ID: ${visiblePart}${trimmed.length > 8 ? '...' : ''}`;
}
