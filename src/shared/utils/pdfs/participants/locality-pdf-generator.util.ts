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
  locality: string;
  age: number;
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

export class LocalityPdfGeneratorUtils {
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

    const content: any[] = [
      ...headerContent,
      {
        text: `Gerado em ${formatDate(new Date())}`,
        style: 'muted',
        margin: [0, 0, 0, 12],
      },
    ];

    for (
      let localityIndex = 0;
      localityIndex < sortedLocalities.length;
      localityIndex += 1
    ) {
      const locality = sortedLocalities[localityIndex];
      const participants = groups.get(locality) ?? [];

      const tableBody = [
        [
          { text: '#', style: 'tableHeader' },
          { text: 'Nome', style: 'tableHeader' },
          { text: 'Localidade', style: 'tableHeader' },
          { text: 'Idade', style: 'tableHeader' },
        ],
        ...participants.map((p) => [
          { text: String(p.index), style: 'tableCell' },
          { text: p.name, style: 'tableCell' },
          { text: p.locality || '-', style: 'tableCell' },
          { text: String(p.age), style: 'tableCell', alignment: 'right' },
        ]),
      ];

      content.push(
        {
          text: String(locality).toUpperCase(),
          style: 'sectionTitle',
          margin: [0, 10, 0, 8],
        },
        {
          table: {
            headerRows: 1,
            widths: [24, '*', 160, 40],
            body: tableBody,
          },
          layout: 'lightHorizontalLines',
        },
      );

      if (localityIndex < sortedLocalities.length - 1) {
        content.push({ text: '', pageBreak: 'after' });
      }
    }

    const docDefinition: any = {
      pageMargins: [32, 32, 32, 32],
      defaultStyle: {
        font: 'OpenSans',
        fontSize: 10,
        color: '#222222',
      },
      content,
      styles: {
        headerTitle: { fontSize: 18, bold: true, color: '#1b1f23' },
        headerTitleDetail: { fontSize: 11, color: '#5b5b5b' },
        muted: { fontSize: 9, color: '#6b7280' },
        sectionTitle: { fontSize: 12, bold: true, color: '#111827' },
        tableHeader: {
          bold: true,
          fillColor: '#f3f4f6',
          margin: [0, 4, 0, 4],
        },
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
