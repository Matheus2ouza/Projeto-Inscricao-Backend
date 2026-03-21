import { genderType, ShirtSize, ShirtType } from 'generated/prisma';
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

export type ParticipantLocalityPdfRow = {
  index: number;
  name: string;
  preferredName?: string;
  locality: string;
  age: number;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  gender?: genderType;
};

export type ParticipantLocalityPdfData = {
  eventName: string;
  participants: ParticipantLocalityPdfRow[];
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(date: Date) {
  const d = new Date(date);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export class ParticipantsByLocalityPdfGenerator {
  public static generateReportPdf(
    data: ParticipantLocalityPdfData,
  ): Promise<Buffer> {
    const headerContent = buildPdfHeaderSection({
      title: data.eventName
        ? `Lista de Participantes: ${data.eventName}`
        : 'Lista de Participantes',
      titleDetail: `${data.participants.length} participante(s)`,
    });

    const groups = new Map<string, ParticipantLocalityPdfRow[]>();
    for (const participant of data.participants) {
      const locality = participant.locality || '-';
      const list = groups.get(locality) ?? [];
      list.push(participant);
      groups.set(locality, list);
    }

    const sortedLocalities = [...groups.keys()].sort((a, b) => {
      if (a === '-' && b !== '-') return 1;
      if (a !== '-' && b === '-') return -1;
      return a.localeCompare(b, 'pt-BR');
    });

    const content: any[] = [...headerContent];

    for (
      let localityIndex = 0;
      localityIndex < sortedLocalities.length;
      localityIndex += 1
    ) {
      const locality = sortedLocalities[localityIndex];
      const participants = groups.get(locality) ?? [];

      content.push(
        {
          text: String(locality).toUpperCase(),
          style: 'sectionTitle',
          margin: [0, 10, 0, 8],
        },
        ...buildParticipantBlocks(participants),
      );

      if (localityIndex < sortedLocalities.length - 1) {
        content.push({ text: '', pageBreak: 'after' });
      }
    }

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      footer: (currentPage: number, pageCount: number) => ({
        text:
          currentPage === pageCount
            ? `Gerado em ${formatDate(new Date())}`
            : '',
        style: 'footer',
        alignment: 'center',
        margin: [40, 10, 40, 0],
      }),
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        lineHeight: 1.3,
      },
      content,
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
        sectionTitle: {
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
        valueText: {
          fontSize: 10,
          color: '#1a202c',
        },
        participantTitle: {
          fontSize: 13,
          bold: true,
          color: '#2d3748',
        },
        footer: {
          fontSize: 9,
          color: '#4a5568',
        },
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

function buildParticipantBlocks(participants: ParticipantLocalityPdfRow[]) {
  return participants.map((p, index) => {
    const localIndex = index + 1;
    const nameLine = p.name;
    const preferredName =
      p.preferredName && p.preferredName.trim().length > 0
        ? p.preferredName
        : undefined;

    return {
      unbreakable: true,
      stack: [
        { text: `#${localIndex} - ${nameLine}`, style: 'participantTitle' },
        {
          columns: [
            {
              width: '25%',
              stack: [
                { text: 'Nome', style: 'labelText' },
                { text: nameLine || '-', style: 'valueText' },
              ],
            },
            {
              width: '25%',
              stack: [
                { text: 'Como ser chamado', style: 'labelText' },
                { text: preferredName || '-', style: 'valueText' },
              ],
            },
            {
              width: '25%',
              stack: [
                { text: 'Localidade', style: 'labelText' },
                { text: p.locality || '-', style: 'valueText' },
              ],
            },
            {
              width: '25%',
              stack: [
                { text: 'Idade', style: 'labelText' },
                { text: String(p.age), style: 'valueText' },
              ],
            },
          ],
          margin: [0, 6, 0, 0],
        },
        {
          columns: [
            {
              width: '33%',
              stack: [
                { text: 'Gênero', style: 'labelText' },
                { text: formatGender(p.gender), style: 'valueText' },
              ],
            },
            {
              width: '33%',
              stack: [
                { text: 'Tamanho', style: 'labelText' },
                { text: formatShirtSize(p.shirtSize), style: 'valueText' },
              ],
            },
            {
              width: '34%',
              stack: [
                { text: 'Tipo', style: 'labelText' },
                { text: formatShirtType(p.shirtType), style: 'valueText' },
              ],
            },
          ],
          margin: [0, 18, 0, 0],
        },
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
          margin: [0, 12, 0, 0],
        },
      ],
      margin: [0, index === 0 ? 0 : 12, 0, 0],
    };
  });
}

function formatGender(gender?: genderType | null): string {
  if (!gender) return '-';
  switch (gender) {
    case 'MASCULINO':
      return 'Masculino';
    case 'FEMININO':
      return 'Feminino';
    default:
      return String(gender);
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
