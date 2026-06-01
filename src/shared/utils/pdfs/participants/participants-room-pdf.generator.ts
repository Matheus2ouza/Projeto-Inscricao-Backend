import path from 'path';
import PdfPrinter from 'pdfmake';

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

export type ParticipantRoomPdfRow = {
  index: number;
  name: string;
  locality: string;
};

export type ParticipantRoomPdfData = {
  title: string;
  participants: ParticipantRoomPdfRow[];
  observation?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(date: Date) {
  const d = new Date(date);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export class ParticipantsRoomPdfGenerator {
  public static generateReportPdf(
    data: ParticipantRoomPdfData,
  ): Promise<Buffer> {
    const content: any[] = [];

    // Adicionar observação se existir (apenas uma vez no conteúdo)
    if (data.observation) {
      content.push({
        text: `Observação: ${data.observation}`,
        style: 'observation',
        alignment: 'left',
        margin: [0, 0, 0, 20],
      });
    }

    // Criar tabela de participantes
    content.push({
      table: {
        headerRows: 1,
        widths: ['10%', '60%', '30%'],
        body: [
          [
            { text: 'Nº', style: 'tableHeader', alignment: 'center' },
            { text: 'Nome do Participante', style: 'tableHeader' },
            { text: 'Localidade', style: 'tableHeader' },
          ],
          ...data.participants.map((participant) => [
            { text: participant.index.toString(), alignment: 'center' },
            { text: participant.name },
            { text: participant.locality },
          ]),
        ],
      },
      margin: [0, 10, 0, 0],
      layout: {
        hLineWidth: (i: number, node: any) => {
          return i === 0 || i === node.table.body.length ? 0 : 0.5;
        },
        vLineWidth: () => 0,
        hLineColor: () => '#e2e8f0',
        paddingLeft: () => 8,
        paddingRight: () => 8,
        paddingTop: () => 6,
        paddingBottom: () => 6,
      },
    });

    const docDefinition: any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      // Header que aparece em todas as páginas
      header: () => ({
        text: data.title,
        style: 'headerTitle',
        alignment: 'center',
        margin: [40, 20, 40, 0],
      }),
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
        observation: {
          fontSize: 10,
          color: '#718096',
          italics: true,
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: '#1a365d',
          fillColor: '#e2e8f0',
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
